"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientIp, looksLikeSpam, rateLimit } from "@/lib/security";
import {
  cartItemSchema,
  checkoutSchema,
  contactSchema,
  reservationSchema,
  type FormResult,
} from "@/lib/validators";
import { generateCode } from "@/lib/text";
import { KVKK_TEXT_VERSION, SEAT_HOLDING_STATUSES } from "@/lib/site";
import { getSetting } from "@/lib/settings";
import { buildOrderMessage, buildReservationMessage, whatsappLink } from "@/lib/whatsapp";
import { t } from "@/i18n";
import { hasDatabase, PREVIEW_ORDER_MESSAGE } from "@/lib/demo";

function fieldErrors(err: z.ZodError) {
  return err.flatten().fieldErrors as Record<string, string[] | undefined>;
}

// ------------------------------------------------------------------
// Sipariş oluşturma → WhatsApp
// ------------------------------------------------------------------

export async function createOrder(
  rawItems: unknown,
  rawForm: unknown,
): Promise<FormResult<{ code: string; whatsappUrl: string | null }>> {
  if (!hasDatabase) return { ok: false, error: PREVIEW_ORDER_MESSAGE };
  const items = z.array(cartItemSchema).min(1, "Sepetiniz boş.").max(30).safeParse(rawItems);
  if (!items.success) return { ok: false, error: "Sepetiniz boş veya geçersiz." };

  const form = checkoutSchema.safeParse(rawForm);
  if (!form.success) return { ok: false, error: "Lütfen formdaki hataları düzeltin.", fieldErrors: fieldErrors(form.error) };
  if (looksLikeSpam(form.data)) return { ok: false, error: t.errors.spam };

  const ip = await getClientIp();
  if (!(await rateLimit(`order:${ip}`, 6, 60 * 60))) return { ok: false, error: t.errors.rateLimited };

  // Fiyat ve stok her zaman veritabanından yeniden okunur — istemciye güvenilmez.
  const ids = [...new Set(items.data.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  let total = 0;
  let hasUnpriced = false;
  for (const item of items.data) {
    const p = byId.get(item.productId);
    if (!p) return { ok: false, error: "Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi kontrol edin." };
    if (p.stock !== null && p.stock < item.quantity) {
      return { ok: false, error: `"${p.name}" için yeterli stok yok (kalan: ${Math.max(0, p.stock)}).` };
    }
    const color = item.color && p.colors.includes(item.color) ? item.color : null;
    const fragrance = item.fragrance && p.fragrances.includes(item.fragrance) ? item.fragrance : null;
    if (p.priceCents === null) hasUnpriced = true;
    else total += p.priceCents * item.quantity;
    lines.push({
      product: { connect: { id: p.id } },
      productName: p.name,
      unitPriceCents: p.priceCents,
      quantity: item.quantity,
      color,
      fragrance,
    });
  }

  const f = form.data;
  const isCargo = f.deliveryMethod === "KARGO";
  let order;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      order = await prisma.order.create({
        data: {
          code: generateCode("MS"),
          customerName: f.customerName,
          phone: f.phone,
          email: f.email || null,
          city: isCargo ? f.city || null : null,
          address: isCargo ? f.address || null : null,
          deliveryMethod: f.deliveryMethod,
          note: f.note || null,
          totalCents: total,
          hasUnpricedItems: hasUnpriced,
          kvkkConsent: true,
          marketingConsent: Boolean(f.marketingConsent),
          consentTextVersion: KVKK_TEXT_VERSION,
          consentAt: new Date(),
          items: { create: lines },
        },
        include: { items: true },
      });
      break;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue; // kod çakışması
      console.error("Sipariş oluşturulamadı", err);
      return { ok: false, error: t.errors.generic };
    }
  }
  if (!order) return { ok: false, error: t.errors.generic };

  const business = await getSetting("business");
  const whatsappUrl = whatsappLink(business.whatsapp, buildOrderMessage(order));
  return { ok: true, data: { code: order.code, whatsappUrl } };
}

// ------------------------------------------------------------------
// Workshop rezervasyonu (kapasite aşımı engellenir)
// ------------------------------------------------------------------

export async function createReservation(
  raw: unknown,
): Promise<FormResult<{ code: string; whatsappUrl: string | null }>> {
  if (!hasDatabase) return { ok: false, error: "Rezervasyon sistemi henüz açılmadı. Lütfen Instagram'dan @mumeatolye hesabına yazın." };
  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Lütfen formdaki hataları düzeltin.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (looksLikeSpam(d)) return { ok: false, error: t.errors.spam };

  const ip = await getClientIp();
  if (!(await rateLimit(`reservation:${ip}`, 5, 60 * 60))) return { ok: false, error: t.errors.rateLimited };

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Oturum satırını kilitleyerek aynı anda gelen taleplerin kapasiteyi aşmasını önler.
        const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "WorkshopSession" WHERE id = ${d.sessionId} FOR UPDATE`;
        if (!locked.length) throw new ReservationError("Seçtiğiniz tarih bulunamadı.");

        const session = await tx.workshopSession.findUnique({ where: { id: d.sessionId }, include: { workshop: true } });
        if (!session || !session.isActive || !session.workshop.isActive) throw new ReservationError("Bu tarih artık rezervasyona açık değil.");
        if (session.startsAt <= new Date()) throw new ReservationError("Bu workshop tarihi geçmiş.");

        const agg = await tx.reservation.aggregate({
          where: { sessionId: session.id, status: { in: [...SEAT_HOLDING_STATUSES] } },
          _sum: { participants: true },
        });
        const left = session.capacity - (agg._sum.participants ?? 0);
        if (left <= 0) throw new ReservationError("Üzgünüz, bu tarihte boş yer kalmadı. Lütfen başka bir tarih seçin.");
        if (d.participants > left) throw new ReservationError(`Bu tarihte yalnızca ${left} kişilik yer kaldı.`);

        const reservation = await tx.reservation.create({
          data: {
            code: generateCode("MW"),
            sessionId: session.id,
            fullName: d.fullName,
            phone: d.phone,
            email: d.email || null,
            participants: d.participants,
            note: d.note || null,
            kvkkConsent: true,
            consentTextVersion: KVKK_TEXT_VERSION,
            consentAt: new Date(),
          },
        });
        return { reservation, session };
      },
      { timeout: 10000 },
    );

    const business = await getSetting("business");
    const whatsappUrl = whatsappLink(
      business.whatsapp,
      buildReservationMessage({
        code: result.reservation.code,
        workshopTitle: result.session.workshop.title,
        startsAt: result.session.startsAt,
        participants: result.reservation.participants,
        fullName: result.reservation.fullName,
      }),
    );
    return { ok: true, data: { code: result.reservation.code, whatsappUrl } };
  } catch (err) {
    if (err instanceof ReservationError) return { ok: false, error: err.message };
    console.error("Rezervasyon oluşturulamadı", err);
    return { ok: false, error: t.errors.generic };
  }
}

class ReservationError extends Error {}

// ------------------------------------------------------------------
// İletişim formu
// ------------------------------------------------------------------

export async function sendContactMessage(raw: unknown): Promise<FormResult> {
  if (!hasDatabase) return { ok: false, error: "İletişim formu henüz etkin değil. Lütfen Instagram'dan @mumeatolye hesabına yazın." };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Lütfen formdaki hataları düzeltin.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (looksLikeSpam(d)) return { ok: false, error: t.errors.spam };
  if (!d.phone && !d.email) return { ok: false, error: "Size dönebilmemiz için telefon veya e-posta bilgisi bırakın." };

  const ip = await getClientIp();
  if (!(await rateLimit(`contact:${ip}`, 5, 60 * 60))) return { ok: false, error: t.errors.rateLimited };

  await prisma.contactMessage.create({
    data: {
      name: d.name,
      phone: d.phone || null,
      email: d.email || null,
      subject: d.subject || null,
      message: d.message,
      kvkkConsent: true,
      consentTextVersion: KVKK_TEXT_VERSION,
      consentAt: new Date(),
    },
  });
  return { ok: true, data: undefined };
}

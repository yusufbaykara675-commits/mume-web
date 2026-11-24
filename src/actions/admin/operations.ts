"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { FormError, str, toErrorState, type ActionState } from "@/lib/form-data";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, RESERVATION_STATUS_LABELS, SEAT_HOLDING_STATUSES } from "@/lib/site";

// ------------------------------------------------------------------
// Siparişler
// ------------------------------------------------------------------

const STOCK_CONSUMING: OrderStatus[] = ["ONAYLANDI", "HAZIRLANIYOR", "KARGODA", "TAMAMLANDI"];

/**
 * Sipariş durumunu günceller. Stok, sipariş ilk kez onaylandığında düşülür
 * ve iptal edilirse geri eklenir (bot/sahte siparişlerin stoku kilitlememesi için).
 */
export async function updateOrder(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = str(fd, "id", 40);
    const status = str(fd, "status", 20) as OrderStatus;
    const paymentStatus = str(fd, "paymentStatus", 20) as PaymentStatus;
    const adminNote = str(fd, "adminNote", 2000) || null;
    if (!(status in ORDER_STATUS_LABELS)) throw new FormError("Geçersiz sipariş durumu.");
    if (!(paymentStatus in PAYMENT_STATUS_LABELS)) throw new FormError("Geçersiz ödeme durumu.");

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new FormError("Sipariş bulunamadı.");
      let stockDeducted = order.stockDeducted;

      if (STOCK_CONSUMING.includes(status) && !order.stockDeducted) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (!p || p.stock === null) continue; // siparişe özel üretim: stok takibi yok
          if (p.stock < item.quantity) throw new FormError(`"${p.name}" için stok yetersiz (stok: ${p.stock}). Önce stoku güncelleyin.`);
          await tx.product.update({ where: { id: p.id }, data: { stock: { decrement: item.quantity } } });
        }
        stockDeducted = true;
      }
      if (status === "IPTAL" && order.stockDeducted) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (!p || p.stock === null) continue;
          await tx.product.update({ where: { id: p.id }, data: { stock: { increment: item.quantity } } });
        }
        stockDeducted = false;
      }
      await tx.order.update({ where: { id }, data: { status, paymentStatus, adminNote, stockDeducted } });
    });
    revalidatePath("/yonetim", "layout");
    revalidatePath("/", "layout");
    return { ok: "Sipariş güncellendi." };
  } catch (err) {
    return toErrorState(err);
  }
}

// ------------------------------------------------------------------
// Rezervasyonlar
// ------------------------------------------------------------------

export async function updateReservation(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = str(fd, "id", 40);
    const status = str(fd, "status", 20) as ReservationStatus;
    const adminNote = str(fd, "adminNote", 1000) || null;
    if (!(status in RESERVATION_STATUS_LABELS)) throw new FormError("Geçersiz durum.");

    await prisma.$transaction(async (tx) => {
      const r = await tx.reservation.findUnique({ where: { id } });
      if (!r) throw new FormError("Rezervasyon bulunamadı.");
      const wasHolding = (SEAT_HOLDING_STATUSES as readonly string[]).includes(r.status);
      const willHold = (SEAT_HOLDING_STATUSES as readonly string[]).includes(status);
      if (!wasHolding && willHold) {
        // Reddedilmiş/iptal bir rezervasyonu yeniden açarken kapasite kontrol edilir
        await tx.$queryRaw`SELECT id FROM "WorkshopSession" WHERE id = ${r.sessionId} FOR UPDATE`;
        const session = await tx.workshopSession.findUnique({ where: { id: r.sessionId } });
        const agg = await tx.reservation.aggregate({
          where: { sessionId: r.sessionId, status: { in: [...SEAT_HOLDING_STATUSES] } },
          _sum: { participants: true },
        });
        const left = (session?.capacity ?? 0) - (agg._sum.participants ?? 0);
        if (r.participants > left) throw new FormError(`Bu oturumda yalnızca ${Math.max(0, left)} kişilik yer var; kapasiteyi artırmadan onaylanamaz.`);
      }
      await tx.reservation.update({ where: { id }, data: { status, adminNote } });
    });
    revalidatePath("/yonetim", "layout");
    revalidatePath("/workshoplar", "layout");
    return { ok: "Rezervasyon güncellendi." };
  } catch (err) {
    return toErrorState(err);
  }
}

// ------------------------------------------------------------------
// İletişim mesajları
// ------------------------------------------------------------------

export async function setMessageFlags(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const action = str(fd, "action", 20);
  if (action === "sil") await prisma.contactMessage.delete({ where: { id } });
  else
    await prisma.contactMessage.update({
      where: { id },
      data:
        action === "okundu"
          ? { isRead: true }
          : action === "okunmadi"
            ? { isRead: false }
            : action === "arsivle"
              ? { isArchived: true, isRead: true }
              : { isArchived: false },
    });
  revalidatePath("/yonetim", "layout");
}

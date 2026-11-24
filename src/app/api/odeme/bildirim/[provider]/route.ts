import { prisma } from "@/lib/db";
import { getPaymentProvider, paymentsEnabled } from "@/lib/payments";

/**
 * Ödeme sağlayıcısı bildirim (callback/webhook) uç noktası.
 * Online ödeme etkin değilken 404 döner. Etkinleştirildiğinde yalnızca imzası
 * doğrulanan ve tutarı siparişle eşleşen bildirimler siparişi "ODENDI" yapar.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!paymentsEnabled()) return new Response("Online ödeme etkin değil", { status: 404 });

  const impl = getPaymentProvider();
  if (impl.name !== provider) return new Response("Geçersiz sağlayıcı", { status: 400 });

  let verified;
  try {
    verified = await impl.verifyCallback(req);
  } catch (err) {
    console.error("Ödeme bildirimi doğrulanamadı", err);
    return new Response("Doğrulama başarısız", { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { code: verified.orderCode } });
  if (!order) return new Response("Sipariş bulunamadı", { status: 404 });

  if (!verified.success) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "BASARISIZ", paymentProvider: impl.name } });
    return new Response("OK");
  }
  if (verified.amountCents !== order.totalCents) {
    console.error("Ödeme tutarı uyuşmuyor", { order: order.code, expected: order.totalCents, got: verified.amountCents });
    return new Response("Tutar uyuşmuyor", { status: 400 });
  }
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "ODENDI", paymentProvider: impl.name, paymentReference: verified.providerReference },
  });
  return new Response("OK");
}

import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";

/** İstemci IP adresini proxy başlıklarından okur (Caddy/Vercel/Cloudflare). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "bilinmiyor"
  );
}

/**
 * Veritabanı tabanlı basit hız sınırlayıcı (sabit pencere).
 * true dönerse işlem yapılabilir; false ise sınır aşılmıştır.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const windowStartLimit = new Date(now.getTime() - windowSeconds * 1000);
  try {
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row || row.windowStart < windowStartLimit) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return true;
    }
    if (row.count >= limit) return false;
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return true;
  } catch (err) {
    console.error("Hız sınırlayıcı hatası", err);
    return true; // veritabanı hatasında kullanıcıyı engelleme
  }
}

export async function resetRateLimit(key: string) {
  await prisma.rateLimit.delete({ where: { key } }).catch(() => undefined);
}

/**
 * Spam koruması: gizli "website" alanı (bal küpü) doluysa veya form
 * 2 saniyeden kısa sürede gönderildiyse bot kabul edilir.
 */
export function looksLikeSpam(input: { website?: string | null; startedAt?: number | string | null }): boolean {
  if (input.website && String(input.website).trim() !== "") return true;
  const started = Number(input.startedAt);
  if (!Number.isFinite(started) || started <= 0) return true;
  const elapsed = Date.now() - started;
  return elapsed < 2000 || elapsed > 1000 * 60 * 60 * 24;
}

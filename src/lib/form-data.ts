// Yönetim formlarından gelen FormData'yı güvenli şekilde okumak için yardımcılar.

export type ActionState = { ok?: string; error?: string } | undefined;

export function str(fd: FormData, key: string, max = 5000): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function optStr(fd: FormData, key: string, max = 5000): string | null {
  const v = str(fd, key, max);
  return v === "" ? null : v;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function int(fd: FormData, key: string, opts: { min?: number; max?: number } = {}): number | null {
  const raw = str(fd, key, 20);
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new FormError(`"${key}" alanına tam sayı girin.`);
  if (opts.min !== undefined && n < opts.min) throw new FormError(`"${key}" en az ${opts.min} olmalı.`);
  if (opts.max !== undefined && n > opts.max) throw new FormError(`"${key}" en fazla ${opts.max} olabilir.`);
  return n;
}

export function files(fd: FormData, key: string): File[] {
  return fd.getAll(key).filter((f): f is File => typeof f === "object" && f !== null && "size" in f && (f as File).size > 0);
}

export class FormError extends Error {}

/** Beklenen form hatalarını kullanıcı mesajına, beklenmeyenleri genel mesaja çevirir. */
export function toErrorState(err: unknown): ActionState {
  if (err instanceof FormError) return { error: err.message };
  if (err && typeof err === "object" && "name" in err && (err as Error).name === "UploadError") return { error: (err as Error).message };
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
    return { error: "Bu adres (slug) zaten kullanılıyor. Lütfen farklı bir değer girin." };
  }
  // Next.js yönlendirmeleri hata olarak fırlatılır; yeniden fırlatılmalı
  if (err && typeof err === "object" && "digest" in err && String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw err;
  console.error(err);
  return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
}

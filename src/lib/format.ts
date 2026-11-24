import { TIME_ZONE } from "./site";

const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

/** Kuruşu "₺450,00" biçiminde gösterir. null ise "Fiyat için yazın" döner. */
export function formatPrice(cents: number | null | undefined, emptyLabel = "Fiyat için yazın"): string {
  if (cents === null || cents === undefined) return emptyLabel;
  return tryFormatter.format(cents / 100);
}

/** "450", "450,5", "1.250,00" gibi girişleri kuruşa çevirir. Boşsa null. */
export function parsePriceToCents(input: string | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const normalized = raw.replace(/\s|₺|TL/gi, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) throw new Error("Geçersiz fiyat");
  return Math.round(value * 100);
}

/** Kuruşu form alanında gösterilecek "450,00" metnine çevirir. */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} saat ${m} dakika`;
  if (h) return `${h} saat`;
  return `${m} dakika`;
}

/**
 * Yönetim panelindeki "datetime-local" alanını (Türkiye saati) UTC Date'e çevirir.
 * Türkiye 2016'dan beri yıl boyu UTC+3 kullanır.
 */
export function istanbulInputToDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Geçersiz tarih");
  return new Date(`${value}:00+03:00`);
}

export function dateToIstanbulInput(date: Date): string {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

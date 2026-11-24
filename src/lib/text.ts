import { randomBytes } from "crypto";

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u", â: "a", Â: "a", ê: "e", Ê: "e", î: "i", û: "u",
};

/** Türkçe karakterleri dönüştürerek SEO dostu adres parçası üretir. */
export function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışan karakterler çıkarıldı

/** Sipariş / rezervasyon için tahmin edilmesi zor kısa kod: ör. MS-7KQ2-9XHD */
export function generateCode(prefix: string): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${prefix}-${out.slice(0, 4)}-${out.slice(4)}`;
}

/** Çok satırlı metni paragraf dizisine çevirir. */
export function toParagraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** "a, b , c" → ["a","b","c"] */
export function splitList(input: string | null | undefined): string[] {
  return (input ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

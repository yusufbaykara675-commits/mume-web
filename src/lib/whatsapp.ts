import { formatPrice, formatDateTime } from "./format";
import { DELIVERY_LABELS } from "./site";

/** "0 (532) 123 45 67" → "905321234567". Geçersizse boş döner. */
export function normalizeWhatsapp(input: string | null | undefined): string {
  const digits = (input ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `9${digits}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  return digits.length >= 10 ? digits : "";
}

export function whatsappLink(number: string, text?: string): string | null {
  const n = normalizeWhatsapp(number);
  if (!n) return null;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

type OrderForMessage = {
  code: string;
  customerName: string;
  phone: string;
  city?: string | null;
  address?: string | null;
  deliveryMethod: keyof typeof DELIVERY_LABELS;
  note?: string | null;
  totalCents: number;
  hasUnpricedItems: boolean;
  items: { productName: string; quantity: number; unitPriceCents: number | null; color?: string | null; fragrance?: string | null }[];
};

export function buildOrderMessage(order: OrderForMessage): string {
  const lines: (string | null)[] = [
    `Merhaba MuMê 🕯️ Sitenizden sipariş oluşturdum.`,
    ``,
    `Sipariş no: ${order.code}`,
    ``,
    ...order.items.map((i) => {
      const opts = [i.color && `Renk: ${i.color}`, i.fragrance && `Koku: ${i.fragrance}`].filter(Boolean).join(", ");
      const price = i.unitPriceCents === null ? "fiyat teyit edilecek" : formatPrice(i.unitPriceCents * i.quantity);
      return `• ${i.quantity} x ${i.productName}${opts ? ` (${opts})` : ""} — ${price}`;
    }),
    ``,
    `Ara toplam: ${formatPrice(order.totalCents)}${order.hasUnpricedItems ? " + fiyatı teyit edilecek ürünler" : ""}`,
    `Teslimat: ${DELIVERY_LABELS[order.deliveryMethod]}`,
    order.deliveryMethod === "KARGO" && order.city ? `Şehir: ${order.city}` : null,
    `Ad Soyad: ${order.customerName}`,
    `Telefon: ${order.phone}`,
    order.note ? `Not: ${order.note}` : null,
    ``,
    order.deliveryMethod === "KARGO" ? `Kargo ücreti ve ödeme bilgisini rica ederim.` : `Teslim alma zamanı ve ödeme bilgisini rica ederim.`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

export function buildReservationMessage(r: {
  code: string;
  workshopTitle: string;
  startsAt: Date | string;
  participants: number;
  fullName: string;
}): string {
  return [
    `Merhaba MuMê 🕯️ Workshop rezervasyon talebi oluşturdum.`,
    ``,
    `Rezervasyon no: ${r.code}`,
    `Workshop: ${r.workshopTitle}`,
    `Tarih: ${formatDateTime(r.startsAt)}`,
    `Kişi sayısı: ${r.participants}`,
    `Ad Soyad: ${r.fullName}`,
    ``,
    `Onayınızı bekliyorum.`,
  ].join("\n");
}

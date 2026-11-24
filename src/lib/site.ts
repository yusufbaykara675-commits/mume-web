export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "MuMê Mum Atölyesi";

export const TIME_ZONE = "Europe/Istanbul";

/**
 * KVKK aydınlatma metninin sürümü. Metni değiştirdiğinizde bu değeri güncelleyin;
 * her sipariş/rezervasyon/mesaj hangi sürüme onay verildiğini kaydeder.
 */
export const KVKK_TEXT_VERSION = "2026-11-v1";

export const ORDER_STATUS_LABELS = {
  YENI: "Yeni",
  ONAYLANDI: "Onaylandı",
  HAZIRLANIYOR: "Hazırlanıyor",
  KARGODA: "Kargoda",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
} as const;

export const PAYMENT_STATUS_LABELS = {
  ODENMEDI: "Ödenmedi",
  BEKLIYOR: "Ödeme bekleniyor",
  ODENDI: "Ödendi",
  IADE: "İade edildi",
  BASARISIZ: "Başarısız",
} as const;

export const RESERVATION_STATUS_LABELS = {
  BEKLIYOR: "Onay bekliyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  IPTAL: "İptal edildi",
} as const;

export const DELIVERY_LABELS = {
  KARGO: "Kargo ile gönderim",
  ATOLYEDEN_TESLIM: "Atölyeden teslim alma",
} as const;

/** Rezervasyonda koltuk tutan durumlar */
export const SEAT_HOLDING_STATUSES = ["BEKLIYOR", "ONAYLANDI"] as const;

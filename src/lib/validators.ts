import { z } from "zod";

// İstemci ve sunucu tarafında ortak kullanılan form şemaları (Türkçe hata mesajlarıyla).

const phone = z
  .string()
  .trim()
  .min(10, "Geçerli bir telefon numarası girin.")
  .max(20, "Telefon numarası çok uzun.")
  .regex(/^[+\d\s()-]+$/, "Telefon numarası yalnızca rakam içermelidir.");

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Geçerli bir e-posta adresi girin.");

const kvkk = z.boolean().refine((v) => v === true, "Devam etmek için aydınlatma metnini onaylamanız gerekir.");

const antiSpam = {
  website: z.string().optional(), // bal küpü
  startedAt: z.number().optional(),
};

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  color: z.string().max(60).optional().nullable(),
  fragrance: z.string().max(60).optional().nullable(),
});

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(3, "Adınızı ve soyadınızı girin.").max(80),
    phone,
    email: optionalEmail,
    deliveryMethod: z.enum(["KARGO", "ATOLYEDEN_TESLIM"]),
    city: z.string().trim().max(60).optional().or(z.literal("")),
    address: z.string().trim().max(400).optional().or(z.literal("")),
    note: z.string().trim().max(600).optional().or(z.literal("")),
    kvkkConsent: kvkk,
    marketingConsent: z.boolean().optional(),
    ...antiSpam,
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMethod === "KARGO") {
      if (!v.city || v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Şehir bilgisini girin." });
      if (!v.address || v.address.length < 10)
        ctx.addIssue({ code: "custom", path: ["address"], message: "Teslimat adresini açık şekilde yazın." });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reservationSchema = z.object({
  sessionId: z.string().min(1, "Lütfen bir tarih seçin."),
  participants: z.number({ invalid_type_error: "Kişi sayısını seçin." }).int().min(1, "En az 1 kişi seçin.").max(20, "Daha büyük gruplar için lütfen bize yazın."),
  fullName: z.string().trim().min(3, "Adınızı ve soyadınızı girin.").max(80),
  phone,
  email: optionalEmail,
  note: z.string().trim().max(500).optional().or(z.literal("")),
  kvkkConsent: kvkk,
  ...antiSpam,
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin.").max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: optionalEmail,
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesajınız en az 10 karakter olmalı.").max(2000),
  kvkkConsent: kvkk,
  ...antiSpam,
});

export type ContactInput = z.infer<typeof contactSchema>;

export type FormResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

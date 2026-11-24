import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { hasDatabase } from "./demo";

/**
 * Yönetim panelinden düzenlenebilen tüm site içerikleri.
 * Veritabanında kayıt yoksa aşağıdaki varsayılanlar kullanılır.
 */

const dayHours = z.object({
  day: z.string(),
  closed: z.boolean().default(false),
  open: z.string().default("10:00"),
  close: z.string().default("19:00"),
});

export const settingSchemas = {
  business: z.object({
    name: z.string().default("MuMê Mum Atölyesi"),
    tagline: z.string().default("El yapımı tasarım mumlar & mum workshopları"),
    phone: z.string().default(""),
    // Uluslararası biçimde, başında + olmadan: 905XXXXXXXXX
    whatsapp: z.string().default(""),
    email: z.string().default(""),
    instagramUrl: z.string().default("https://www.instagram.com/mumeatolye/"),
    instagramHandle: z.string().default("@mumeatolye"),
    addressLine: z.string().default("Şerefiye Mahallesi, Kültür Sarayı 1. Sokak, Baran Apartmanı"),
    district: z.string().default("İpekyolu"),
    city: z.string().default("Van"),
    country: z.string().default("Türkiye"),
    postalCode: z.string().default(""),
    mapsQuery: z.string().default("Şerefiye Mahallesi Kültür Sarayı 1. Sokak Baran Apartmanı Van"),
    latitude: z.string().default(""),
    longitude: z.string().default(""),
  }),
  hours: z.object({
    note: z.string().default("Workshop günlerinde saatler değişebilir; gelmeden önce lütfen yazın."),
    days: z.array(dayHours).default([
      { day: "Pazartesi", closed: false, open: "10:00", close: "19:00" },
      { day: "Salı", closed: false, open: "10:00", close: "19:00" },
      { day: "Çarşamba", closed: false, open: "10:00", close: "19:00" },
      { day: "Perşembe", closed: false, open: "10:00", close: "19:00" },
      { day: "Cuma", closed: false, open: "10:00", close: "19:00" },
      { day: "Cumartesi", closed: false, open: "11:00", close: "18:00" },
      { day: "Pazar", closed: true, open: "", close: "" },
    ]),
  }),
  home: z.object({
    announcement: z.string().default(""),
    heroEyebrow: z.string().default("Van'da el yapımı mum atölyesi"),
    heroTitle: z.string().default("Her Mumda Bir Hikâye, Her Işıkta Bir Anı."),
    heroText: z
      .string()
      .default(
        "Çiçeklerle bezenmiş, özenle dökülen, sevdiklerinize armağan edilmeye hazır el yapımı tasarım mumlar. Atölyemizde kendi mumunuzu tasarlamaya da davetlisiniz.",
      ),
    heroImage: z.string().default("/art/hero.svg"),
    heroImageAlt: z.string().default("MuMê atölyesinden el yapımı mumlar"),
    storyTitle: z.string().default("Küçük bir atölyede, büyük bir özenle"),
    storyText: z
      .string()
      .default(
        "MuMê'de her mum elde dökülür, her çiçek tek tek yerleştirilir. Bir mumu yakmak; bir anı hatırlamak, bir sofrayı ısıtmak, birine \"seni düşündüm\" demektir.\n\nBu metin örnektir — yönetim panelindeki İçerik bölümünden kendi hikâyenizle değiştirin.",
      ),
    storyImage: z.string().default("/art/hikaye.svg"),
    giftTitle: z.string().default("Hediyenin en sıcak hâli"),
    giftText: z
      .string()
      .default(
        "Doğum günü, öğretmenler günü, yeni ev, nişan ya da sadece \"aklımdasın\" demek için… İsim, tarih ya da kısa bir notla kişiselleştirilmiş mumlar hazırlıyoruz.",
      ),
  }),
  about: z.object({
    title: z.string().default("Hikâyemiz"),
    intro: z
      .string()
      .default("Mum; ışık, koku ve emeğin buluştuğu küçük bir sanat eseridir. MuMê, bu sanatı Van'daki atölyemizde sizinle paylaşmak için var."),
    body: z
      .string()
      .default(
        "Atölyemizde mumlarımızı tek tek elde döküyor, kurutulmuş çiçekler ve doğal dokularla süslüyoruz. Her parça birbirinden biraz farklı; çünkü el yapımı olanın güzelliği tam da buradadır.\n\nWorkshoplarımızda ise kapımızı herkese açıyoruz. Arkadaşlarınızla, ailenizle ya da tek başınıza gelip kendi mumunuzu tasarlıyor, sıcak bir ortamda üretmenin keyfini yaşıyorsunuz.\n\nBu sayfadaki metinler örnektir. Yönetim panelinde İçerik > Hakkımızda bölümünden kendi hikâyenizi yazabilirsiniz.",
      ),
    image: z.string().default("/art/workshop.svg"),
    values: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .default([
        { title: "El yapımı", text: "Her mum atölyemizde, küçük partiler hâlinde elde dökülür." },
        { title: "Tasarım odaklı", text: "Çiçek, renk ve form; her parça bir kompozisyon olarak düşünülür." },
        { title: "Paylaşılan üretim", text: "Workshoplarımızda mum yapmanın keyfini birlikte yaşarız." },
      ]),
  }),
  instagram: z.object({
    // Instagram API anahtarı gerektirmemesi için galeri elle yönetilir.
    posts: z.array(z.object({ image: z.string(), url: z.string(), alt: z.string().default("") })).default([]),
  }),
  seo: z.object({
    homeDescription: z
      .string()
      .default("Van'da el yapımı çiçek tasarımlı, dekoratif ve kişiye özel mumlar; hediyelik mumlar ve mum yapım workshopları."),
  }),
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type Settings = { [K in SettingKey]: z.infer<(typeof settingSchemas)[K]> };

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> {
  const schema = settingSchemas[key];
  if (!hasDatabase) return schema.parse({}) as Settings[K];
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    const parsed = schema.safeParse(row?.value ?? {});
    if (parsed.success) return parsed.data as Settings[K];
  } catch (err) {
    console.error(`Ayar okunamadı: ${key}`, err);
  }
  return schema.parse({}) as Settings[K];
}

export async function getSettings<K extends SettingKey>(keys: K[]): Promise<Pick<Settings, K>> {
  const entries = await Promise.all(keys.map(async (k) => [k, await getSetting(k)] as const));
  return Object.fromEntries(entries) as Pick<Settings, K>;
}

export async function saveSetting<K extends SettingKey>(key: K, value: unknown): Promise<Settings[K]> {
  const data = settingSchemas[key].parse(value) as Settings[K];
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: data as Prisma.InputJsonValue },
    update: { value: data as Prisma.InputJsonValue },
  });
  return data;
}

export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

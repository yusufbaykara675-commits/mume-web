"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSetting, saveSetting } from "@/lib/settings";
import { deleteImage, saveImage } from "@/lib/storage";
import { normalizeWhatsapp } from "@/lib/whatsapp";
import { DEFAULT_LEGAL_TEXTS, type LegalTextKey } from "@/lib/legal";
import { bool, files, FormError, int, str, toErrorState, type ActionState } from "@/lib/form-data";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function done(msg: string): ActionState {
  revalidatePath("/", "layout");
  return { ok: msg };
}

/** Yeni görsel yüklendiyse kaydeder, eski (yüklenmiş) görseli siler. */
async function replaceImage(fd: FormData, field: string, current: string, folder: string) {
  const file = files(fd, field)[0];
  if (!file) return current;
  const url = await saveImage(file, folder);
  await deleteImage(current);
  return url;
}

export async function saveBusiness(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const whatsappRaw = str(fd, "whatsapp", 30);
    const whatsapp = normalizeWhatsapp(whatsappRaw);
    if (whatsappRaw && !whatsapp) throw new FormError("WhatsApp numarası geçersiz. Örnek: 0532 123 45 67");
    const instagramUrl = str(fd, "instagramUrl", 200);
    if (instagramUrl && !/^https:\/\/(www\.)?instagram\.com\//.test(instagramUrl)) throw new FormError("Instagram adresi https://www.instagram.com/ ile başlamalı.");
    await saveSetting("business", {
      name: str(fd, "name", 100) || "MuMê Mum Atölyesi",
      tagline: str(fd, "tagline", 200),
      phone: str(fd, "phone", 30),
      whatsapp,
      email: str(fd, "email", 120),
      instagramUrl: instagramUrl || "https://www.instagram.com/mumeatolye/",
      instagramHandle: str(fd, "instagramHandle", 60),
      addressLine: str(fd, "addressLine", 200),
      district: str(fd, "district", 60),
      city: str(fd, "city", 60),
      country: str(fd, "country", 60) || "Türkiye",
      postalCode: str(fd, "postalCode", 10),
      mapsQuery: str(fd, "mapsQuery", 300),
      latitude: str(fd, "latitude", 20),
      longitude: str(fd, "longitude", 20),
    });
    return done("İşletme bilgileri kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function saveHours(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const days = DAYS.map((day, i) => {
      const closed = bool(fd, `closed_${i}`);
      const open = str(fd, `open_${i}`, 5);
      const close = str(fd, `close_${i}`, 5);
      if (!closed && (!TIME.test(open) || !TIME.test(close))) throw new FormError(`${day} için açılış ve kapanış saatini girin (ör. 10:00).`);
      return { day, closed, open: closed ? "" : open, close: closed ? "" : close };
    });
    await saveSetting("hours", { note: str(fd, "note", 300), days });
    return done("Çalışma saatleri kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function saveHome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const current = await getSetting("home");
    await saveSetting("home", {
      announcement: str(fd, "announcement", 160),
      heroEyebrow: str(fd, "heroEyebrow", 80),
      heroTitle: str(fd, "heroTitle", 120) || current.heroTitle,
      heroText: str(fd, "heroText", 400),
      heroImage: await replaceImage(fd, "heroImageFile", current.heroImage, "banner"),
      heroImageAlt: str(fd, "heroImageAlt", 160),
      storyTitle: str(fd, "storyTitle", 120),
      storyText: str(fd, "storyText", 3000),
      storyImage: await replaceImage(fd, "storyImageFile", current.storyImage, "banner"),
      giftTitle: str(fd, "giftTitle", 120),
      giftText: str(fd, "giftText", 600),
    });
    const seo = await getSetting("seo");
    const homeDescription = str(fd, "seoDescription", 200);
    if (homeDescription) await saveSetting("seo", { ...seo, homeDescription });
    return done("Ana sayfa içerikleri kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function saveAbout(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const current = await getSetting("about");
    const values = [0, 1, 2]
      .map((i) => ({ title: str(fd, `valueTitle_${i}`, 60), text: str(fd, `valueText_${i}`, 200) }))
      .filter((v) => v.title);
    await saveSetting("about", {
      title: str(fd, "title", 100) || "Hikâyemiz",
      intro: str(fd, "intro", 400),
      body: str(fd, "body", 6000),
      image: await replaceImage(fd, "imageFile", current.image, "sayfalar"),
      values,
    });
    return done("Hakkımızda sayfası kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function addInstagramPost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const file = files(fd, "image")[0];
    if (!file) throw new FormError("Bir görsel seçin.");
    const url = str(fd, "url", 300);
    if (url && !/^https:\/\/(www\.)?instagram\.com\//.test(url)) throw new FormError("Bağlantı bir Instagram gönderisi olmalı.");
    const ig = await getSetting("instagram");
    if (ig.posts.length >= 12) throw new FormError("En fazla 12 görsel eklenebilir. Önce birini kaldırın.");
    const image = await saveImage(file, "instagram");
    await saveSetting("instagram", { posts: [{ image, url, alt: str(fd, "alt", 160) }, ...ig.posts] });
    return done("Görsel galeriye eklendi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function removeInstagramPost(fd: FormData) {
  await requireAdmin();
  const index = Number(str(fd, "index", 3));
  const ig = await getSetting("instagram");
  const post = ig.posts[index];
  if (!post) return;
  await saveSetting("instagram", { posts: ig.posts.filter((_, i) => i !== index) });
  await deleteImage(post.image);
  revalidatePath("/", "layout");
}

export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = str(fd, "id", 40) || null;
    const authorName = str(fd, "authorName", 80);
    const text = str(fd, "text", 800);
    if (!authorName || text.length < 5) throw new FormError("Yorum sahibi ve yorum metni gerekli.");
    const data = {
      authorName,
      text,
      source: str(fd, "source", 80) || null,
      isPublished: bool(fd, "isPublished"),
      sortOrder: int(fd, "sortOrder", { min: 0, max: 999 }) ?? 0,
    };
    if (id) await prisma.testimonial.update({ where: { id }, data });
    else await prisma.testimonial.create({ data });
    return done("Yorum kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

export async function deleteTestimonial(fd: FormData) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: str(fd, "id", 40) } });
  revalidatePath("/", "layout");
}

export async function saveLegal(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const current = await getSetting("legal");
    let paymentLogos = await replaceImage(fd, "paymentLogosFile", current.paymentLogos, "odeme");
    if (bool(fd, "removePaymentLogos") && !files(fd, "paymentLogosFile").length) {
      await deleteImage(current.paymentLogos);
      paymentLogos = "";
    }
    // Şablonla aynı bırakılan metin boş kaydedilir; böylece şablon güncellemeleri otomatik yansır.
    const norm = (v: string) => v.replace(/\r\n/g, "\n").trim();
    const text = (key: LegalTextKey) => {
      const v = norm(str(fd, key, 30000));
      return v === norm(DEFAULT_LEGAL_TEXTS[key]) ? "" : v;
    };
    const texts = {
      preInfo: text("preInfo"),
      distanceSales: text("distanceSales"),
      deliveryReturns: text("deliveryReturns"),
      privacy: text("privacy"),
    };
    const sellerTitle = str(fd, "sellerTitle", 160);
    const taxOffice = str(fd, "taxOffice", 80);
    const taxNumber = str(fd, "taxNumber", 20);
    if (taxNumber && !/^\d{10,11}$/.test(taxNumber)) throw new FormError("Vergi numarası 10 haneli (şirket) veya 11 haneli (şahıs/TCKN) olmalı.");
    const mersisNumber = str(fd, "mersisNumber", 20);
    if (mersisNumber && !/^\d{16}$/.test(mersisNumber)) throw new FormError("MERSİS numarası 16 haneli olmalı.");

    // Metin veya satıcı bilgisi değiştiyse yeni sürüm: siparişlerde hangi metnin onaylandığı izlenebilir.
    const changed =
      JSON.stringify(texts) !== JSON.stringify(current.texts) ||
      sellerTitle !== current.sellerTitle ||
      taxOffice !== current.taxOffice ||
      taxNumber !== current.taxNumber ||
      mersisNumber !== current.mersisNumber;
    const version = changed ? new Date().toISOString().slice(0, 16).replace("T", " ") : current.version;

    await saveSetting("legal", { sellerTitle, taxOffice, taxNumber, mersisNumber, paymentLogos, version, texts });
    return done("Yasal bilgiler ve ödeme logoları kaydedildi.");
  } catch (err) {
    return toErrorState(err);
  }
}

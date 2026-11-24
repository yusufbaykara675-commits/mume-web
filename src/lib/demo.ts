import type { Category, Product, ProductImage, Workshop } from "@prisma/client";

/**
 * Önizleme modu: DATABASE_URL tanımlı değilken site bu örnek verilerle çalışır.
 * Veritabanı bağlandığında bu dosya hiç kullanılmaz.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

const now = new Date("2026-11-24T00:00:00Z");

const catDefs = [
  ["Çiçek Tasarımlı Mumlar", "cicek-tasarimli-mumlar", "Kurutulmuş ve doğal çiçeklerle bezenmiş el yapımı mumlar."],
  ["Dekoratif Mumlar", "dekoratif-mumlar", "Evinize sıcaklık katan heykelsi formlar ve dokular."],
  ["Kişiye Özel Mumlar", "kisiye-ozel-mumlar", "İsim, tarih ve notla kişiselleştirilen mumlar."],
  ["Hediyelik Mumlar", "hediyelik-mumlar", "Sevdiklerinize armağan edilmeye hazır şık paketler."],
  ["Özel Gün ve Organizasyon Mumları", "ozel-gun-ve-organizasyon-mumlari", "Söz, nişan, doğum günü ve kurumsal organizasyonlar için."],
] as const;

export const demoCategories: Category[] = catDefs.map(([name, slug, description], i) => ({
  id: `demo-cat-${i}`,
  name,
  slug,
  description,
  imageUrl: null,
  sortOrder: i,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}));

type DemoProduct = Product & { images: ProductImage[]; category: Category | null };

const prodDefs: [string, string, number, boolean, string[], string[], string][] = [
  ["Çiçek Bahçesi Sütun Mum", "cicek-bahcesi-sutun-mum", 0, true, ["Krem", "Adaçayı yeşili"], [], "cicek-bahcesi"],
  ["Lavanta Detaylı Kavanoz Mum", "lavanta-detayli-kavanoz-mum", 0, true, [], ["Kokusuz", "Lavanta"], "lavanta-kavanoz"],
  ["Dalgalı Form Dekoratif Mum", "dalgali-form-dekoratif-mum", 1, true, ["Krem", "Bej", "Kiremit"], [], "dalgali-form"],
  ["Kabartmalı Silindir Mum Seti", "kabartmali-silindir-mum-seti", 1, false, ["Krem"], [], "kabartmali-set"],
  ["İsimli Kişiye Özel Mum", "isimli-kisiye-ozel-mum", 2, true, ["Krem", "Pudra"], [], "isimli-mum"],
  ["Mini Hediyelik Mum Kutusu", "mini-hediyelik-mum-kutusu", 3, false, [], [], "mini-kutu"],
  ["Öğretmenler Günü Hediye Mumu", "ogretmenler-gunu-hediye-mumu", 3, false, [], [], "ogretmenler-gunu"],
  ["Söz & Nişan Masa Mumu", "soz-nisan-masa-mumu", 4, false, ["Beyaz", "Krem"], [], "soz-nisan"],
];

export const demoProducts: DemoProduct[] = prodDefs.map(([name, slug, cat, featured, colors, fragrances, art], i) => ({
  id: `demo-prd-${i}`,
  name,
  slug,
  shortDescription: "Örnek ürün — gerçek açıklama ve fotoğraflar yönetim panelinden eklenecek.",
  description:
    "Bu bir örnek üründür. Gerçek ürün açıklaması, ölçüler, yanma süresi ve kullanım önerileri yönetim panelinden eklenecek.\n\nKişiye özel isim, tarih veya not için bize yazabilirsiniz.",
  priceCents: null,
  compareAtCents: null,
  stock: null,
  colors,
  fragrances,
  isActive: true,
  isFeatured: featured,
  isSample: true,
  categoryId: demoCategories[cat].id,
  createdAt: new Date(now.getTime() - i * 86400000),
  updatedAt: now,
  category: demoCategories[cat],
  images: [{ id: `demo-img-${i}`, productId: `demo-prd-${i}`, url: `/art/${art}.svg`, alt: name, sortOrder: 0 }],
}));

export const demoWorkshops: (Workshop & { sessions: never[] })[] = [
  {
    id: "demo-ws-0",
    title: "Çiçekli Mum Tasarım Workshop'u",
    slug: "cicekli-mum-tasarim-workshopu",
    shortDescription: "Kendi çiçekli mumunuzu tasarlayıp döktüğünüz keyifli bir atölye deneyimi.",
    description:
      "Workshop boyunca mum yapımının temel adımlarını öğrenir, renk ve çiçek seçimiyle kendi tasarımınızı oluşturursunuz.\n\nYeni tarihler yakında açıklanacak. Grup ve özel organizasyon talepleriniz için bize yazabilirsiniz.",
    durationMinutes: 120,
    priceCents: null,
    includes: [],
    coverImageUrl: "/art/workshop.svg",
    gallery: ["/art/kabartmali-set.svg", "/art/lavanta-kavanoz.svg"],
    isActive: true,
    isSample: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    sessions: [],
  },
];

const trLower = (s: string) => s.toLocaleLowerCase("tr-TR");

export function demoSearch(opts: { category?: string; q?: string; sort?: string }) {
  let list = demoProducts.filter((p) => !opts.category || p.category?.slug === opts.category);
  if (opts.q) {
    const q = trLower(opts.q);
    list = list.filter((p) => trLower(`${p.name} ${p.shortDescription} ${p.description}`).includes(q));
  }
  if (opts.sort === "isim") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  else list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  return list;
}

export const PREVIEW_ORDER_MESSAGE =
  "Site şu an önizleme modunda; online sipariş henüz kaydedilmiyor. Sipariş için lütfen Instagram'dan @mumeatolye hesabına yazın.";

/**
 * Örnek içerik ve ilk yönetici hesabı.
 * Çalıştırma: npm run db:seed
 *
 * Tüm örnek ürün ve workshoplar "isSample" olarak işaretlenir; fiyatları boş bırakılmıştır
 * (sitede "Fiyat için yazın" görünür). Yönetim panelinden gerçek bilgilerle güncelleyin veya silin.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Çiçek Tasarımlı Mumlar", slug: "cicek-tasarimli-mumlar", description: "Kurutulmuş ve doğal çiçeklerle bezenmiş el yapımı mumlar." },
  { name: "Dekoratif Mumlar", slug: "dekoratif-mumlar", description: "Evinize sıcaklık katan heykelsi formlar ve dokular." },
  { name: "Kişiye Özel Mumlar", slug: "kisiye-ozel-mumlar", description: "İsim, tarih ve notla kişiselleştirilen mumlar." },
  { name: "Hediyelik Mumlar", slug: "hediyelik-mumlar", description: "Sevdiklerinize armağan edilmeye hazır şık paketler." },
  { name: "Özel Gün ve Organizasyon Mumları", slug: "ozel-gun-ve-organizasyon-mumlari", description: "Söz, nişan, doğum günü ve kurumsal organizasyonlar için." },
];

const products = [
  { name: "Çiçek Bahçesi Sütun Mum", cat: 0, img: "cicek-bahcesi", featured: true, colors: ["Krem", "Adaçayı yeşili"], fragrances: [] },
  { name: "Lavanta Detaylı Kavanoz Mum", cat: 0, img: "lavanta-kavanoz", featured: true, colors: [], fragrances: ["Kokusuz", "Lavanta"] },
  { name: "Dalgalı Form Dekoratif Mum", cat: 1, img: "dalgali-form", featured: true, colors: ["Krem", "Bej", "Kiremit"], fragrances: [] },
  { name: "Kabartmalı Silindir Mum Seti", cat: 1, img: "kabartmali-set", featured: false, colors: ["Krem"], fragrances: [] },
  { name: "İsimli Kişiye Özel Mum", cat: 2, img: "isimli-mum", featured: true, colors: ["Krem", "Pudra"], fragrances: [] },
  { name: "Mini Hediyelik Mum Kutusu", cat: 3, img: "mini-kutu", featured: false, colors: [], fragrances: [] },
  { name: "Öğretmenler Günü Hediye Mumu", cat: 3, img: "ogretmenler-gunu", featured: false, colors: [], fragrances: [] },
  { name: "Söz & Nişan Masa Mumu", cat: 4, img: "soz-nisan", featured: false, colors: ["Beyaz", "Krem"], fragrances: [] },
];

function slugify(s: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u", "&": "ve" };
  return s
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  // 1) Yönetici
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD en az 10 karakter olmalı.");
    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (!exists) {
      await prisma.adminUser.create({ data: { email, name: "MuMê Yönetici", passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✔ Yönetici oluşturuldu: ${email}`);
    } else {
      console.log(`• Yönetici zaten var: ${email}`);
    }
  } else {
    console.warn("! ADMIN_EMAIL / ADMIN_PASSWORD tanımlı değil — yönetici oluşturulmadı.");
  }

  // 2) Kategoriler
  const catIds: string[] = [];
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: i },
      update: {},
    });
    catIds.push(row.id);
  }
  console.log(`✔ ${categories.length} kategori hazır`);

  // 3) Örnek ürünler (yalnızca hiç ürün yoksa)
  if ((await prisma.product.count()) === 0) {
    for (const p of products) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slugify(p.name),
          shortDescription: "Örnek ürün açıklaması — yönetim panelinden düzenleyin.",
          description:
            "Bu bir örnek üründür. Gerçek ürün açıklamanızı, ölçülerini, yanma süresini ve kullanım önerilerini yönetim panelindeki Ürünler bölümünden ekleyin.\n\nFiyat girilmediği için sitede \"Fiyat için yazın\" olarak görünür.",
          priceCents: null,
          stock: null,
          colors: p.colors,
          fragrances: p.fragrances,
          isFeatured: p.featured,
          isSample: true,
          categoryId: catIds[p.cat],
          images: { create: [{ url: `/art/${p.img}.svg`, alt: p.name, sortOrder: 0 }] },
        },
      });
    }
    console.log(`✔ ${products.length} örnek ürün eklendi`);
  }

  // 4) Örnek workshop (oturumları kapalı — tarih eklenince yayına alınır)
  if ((await prisma.workshop.count()) === 0) {
    const nextSat = new Date();
    nextSat.setUTCDate(nextSat.getUTCDate() + ((6 - nextSat.getUTCDay() + 7) % 7 || 7));
    nextSat.setUTCHours(11, 0, 0, 0); // 14:00 Türkiye saati
    await prisma.workshop.create({
      data: {
        title: "Çiçekli Mum Tasarım Workshop'u",
        slug: "cicekli-mum-tasarim-workshopu",
        shortDescription: "Kendi çiçekli mumunuzu tasarlayıp döktüğünüz keyifli bir atölye deneyimi.",
        description:
          "Bu bir örnek workshop açıklamasıdır. Yönetim panelinden içeriği, süreyi, kişi başı ücreti ve dahil olanları güncelleyin.\n\nWorkshop boyunca mum yapımının temel adımlarını öğrenir, renk ve çiçek seçimiyle kendi tasarımınızı oluşturursunuz.",
        durationMinutes: 120,
        priceCents: null,
        includes: ["Örnek madde: Tüm malzemeler atölye tarafından sağlanır", "Örnek madde: Yaptığınız mumu yanınızda götürürsünüz"],
        coverImageUrl: "/art/workshop.svg",
        gallery: ["/art/kabartmali-set.svg", "/art/lavanta-kavanoz.svg"],
        isSample: true,
        sessions: {
          create: [
            { startsAt: nextSat, capacity: 8, isActive: false, note: "Örnek oturum — tarihi düzenleyip yayına alın" },
            {
              startsAt: new Date(nextSat.getTime() + 7 * 86400000),
              capacity: 8,
              isActive: false,
              note: "Örnek oturum — tarihi düzenleyip yayına alın",
            },
          ],
        },
      },
    });
    console.log("✔ Örnek workshop eklendi (oturumlar kapalı)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

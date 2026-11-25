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

// Atölyenin gerçek ürün fotoğraflarından hazırlanan katalog (fiyatlar panelden girilir).
// cat: 0 Çiçek Tasarımlı, 1 Dekoratif, 2 Kişiye Özel, 3 Hediyelik, 4 Özel Gün
const products: {
  name: string;
  cat: number;
  imgs: string[];
  featured: boolean;
  colors: string[];
  short: string;
  desc: string;
}[] = [
  {
    name: "Kuş Figürlü Kabartma Mum",
    cat: 1,
    imgs: ["kus-mumlar"],
    featured: true,
    colors: ["Bordo", "Pudra pembe", "Zümrüt yeşili"],
    short: "Gövdesi kabartma çiçek desenleriyle bezenmiş, kuş formunda el yapımı dekoratif mum.",
    desc: "Kuş formunda dökülen bu mum, gövdesindeki ince kabartma çiçek ve kıvrım desenleriyle raflarınıza ve sofralarınıza zarif bir dokunuş katar.\n\nFotoğrafta bordo, pudra pembe ve zümrüt yeşili renkleri görüyorsunuz; farklı renk istekleriniz için bize yazabilirsiniz.",
  },
  {
    name: "Gözü Bağlı Kadın Heykel Mum",
    cat: 1,
    imgs: ["heykel-mumlar"],
    featured: true,
    colors: ["Gri", "Lila", "Bakır"],
    short: "Dalgalı saçları ve renkli göz bandıyla heykelsi, el yapımı dekoratif mum.",
    desc: "Dalgalı saç kıvrımları ve renkli göz bandıyla heykel görünümlü bu mum, hem dekoratif bir obje hem de özel günler için anlamlı bir hediye.\n\nFotoğrafta gri, lila ve bakır tonları yer alıyor.",
  },
  {
    name: "Kurutulmuş Çiçekli Sütun Mum",
    cat: 0,
    imgs: ["kuru-cicekli-sutun"],
    featured: true,
    colors: [],
    short: "Renkli kurutulmuş çiçek ve yapraklarla bezenmiş beyaz sütun mum.",
    desc: "Beyaz gövdesine yerleştirilen renk renk kurutulmuş çiçek ve yapraklar sayesinde her biri birbirinden farklı görünür. El yapımı olduğu için çiçeklerin dağılımı her mumda benzersizdir.",
  },
  {
    name: "Çiçek Bahçesi Kase Mum",
    cat: 0,
    imgs: ["cicek-bahcesi-kase"],
    featured: true,
    colors: [],
    short: "Cam kase içinde gül, şakayık ve papatya figürleriyle bezenmiş mum.",
    desc: "Cam kasenin içinde, mumdan şekillendirilmiş gül, şakayık ve papatyalarla oluşturulmuş bir çiçek bahçesi. Sofranızda ya da masanızda göz alıcı bir dekor; sevdiklerinize şık bir hediye.",
  },
  {
    name: "Papatya Buketi Kase Mum",
    cat: 0,
    imgs: ["papatya-kase"],
    featured: false,
    colors: [],
    short: "Kabartmalı cam kase içinde papatya ve çiçek figürlü mum.",
    desc: "Kabartmalı cam kase içinde, mumdan yapılmış papatya ve çiçek figürleriyle süslenmiş el yapımı mum. Hediye olarak da sevilen tasarımlarımızdan.",
  },
  {
    name: "Kar Tanesi ve Deniz Kabuğu Kase Mum",
    cat: 3,
    imgs: ["kar-tanesi-kase"],
    featured: false,
    colors: [],
    short: "Kar tanesi ve deniz kabuğu figürleriyle süslenmiş cam kase mum.",
    desc: "Cam kase içinde, kar tanesi ve deniz kabuğu figürleriyle süslenmiş el yapımı mum. Yılbaşı ve kış hediyeleri için özel bir seçenek.",
  },
  {
    name: "Işıltılı Burgu Sütun Mum",
    cat: 1,
    imgs: ["isiltili-burgu"],
    featured: false,
    colors: [],
    short: "Mavi, mor ve altın tonlarında ışıltılı, burgu desenli sütun mum.",
    desc: "Burgu desenli gövdesi mavi, mor ve altın tonlarında ışıltılı bir yüzeyle tamamlanmış dekoratif sütun mum. Işıltı sevenler için.",
  },
  {
    name: "Burgulu Kaktüs Mum",
    cat: 1,
    imgs: ["kaktus-mum"],
    featured: false,
    colors: [],
    short: "Yeşil, burgulu formuyla kaktüs görünümlü dekoratif mum.",
    desc: "Yeşilin dinlendirici tonunda, burgulu dilimleriyle kaktüs görünümlü el yapımı dekoratif mum.",
  },
  {
    name: "Deniz Temalı Jel Mum",
    cat: 3,
    imgs: ["deniz-jel-mumlar"],
    featured: false,
    colors: [],
    short: "Cam kavanozda taşlar, deniz kabukları ve kuru dallarla deniz temalı jel mum.",
    desc: "Şeffaf jel mumun içinde taşlar, deniz kabukları ve kuru dallarla küçük bir deniz dünyası. Cam kavanozda hazırlanır; hediye olarak sevilir.",
  },
  {
    name: "Tarçınlı Jel Kavanoz Mum",
    cat: 3,
    imgs: ["tarcinli-jel-1", "tarcinli-jel-2"],
    featured: false,
    colors: [],
    short: "Tarçın çubukları ve kurutulmuş çiçeklerle süslenmiş, ip sargılı jel kavanoz mum.",
    desc: "Şeffaf jel mumun içinde tarçın çubukları ve çiçek yaprakları; kavanozun ağzı jüt iple sarılıp kurutulmuş çiçekle tamamlanır.",
  },
  {
    name: "El Boyaması Tarot Mum — Güneş",
    cat: 2,
    imgs: ["tarot-gunes"],
    featured: false,
    colors: [],
    short: "Güneş kartı tasarımıyla elde boyanmış dekoratif mum.",
    desc: "Güneş tarot kartından ilham alınarak tek tek elde boyanan dekoratif mum. El işçiliği olduğu için her biri biraz farklıdır.",
  },
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
    if (password.length < 10) {
      console.warn("! ADMIN_PASSWORD en az 10 karakter olmalı — yönetici oluşturulmadı.");
    } else {
    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (!exists) {
      await prisma.adminUser.create({ data: { email, name: "MuMê Yönetici", passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✔ Yönetici oluşturuldu: ${email}`);
    } else {
      console.log(`• Yönetici zaten var: ${email}`);
    }
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

  // 3) Ürünler — örnek ürünler varsa (veya hiç ürün yoksa) gerçek fotoğraflı katalogla değiştirilir.
  //    Panelden düzenlenmiş ürünlere dokunulmaz (kaydedilen ürünün örnek işareti kalkar).
  const catalogFlag = await prisma.siteSetting.findUnique({ where: { key: "migration_catalog_v2" } });
  if (!catalogFlag) {
    const removed = await prisma.product.deleteMany({ where: { isSample: true } });
    const remaining = await prisma.product.count();
    if (removed.count > 0 || remaining === 0) {
      for (const p of products) {
        const slug = slugify(p.name);
        if (await prisma.product.findUnique({ where: { slug } })) continue;
        await prisma.product.create({
          data: {
            name: p.name,
            slug,
            shortDescription: p.short,
            description: p.desc,
            priceCents: null,
            stock: null,
            colors: p.colors,
            fragrances: [],
            isFeatured: p.featured,
            isSample: false,
            categoryId: catIds[p.cat],
            images: { create: p.imgs.map((img, i) => ({ url: `/photos/${img}.webp`, alt: p.name, sortOrder: i })) },
          },
        });
      }
      console.log(`✔ Fotoğraflı katalog oluşturuldu (${products.length} ürün)`);
    }
    // Örnek workshop görsellerini gerçek fotoğraflarla değiştir
    await prisma.workshop.updateMany({
      where: { isSample: true },
      data: { coverImageUrl: "/photos/tarot-gunes.webp", gallery: ["/photos/atolye-deniz-kizi.webp", "/photos/kuru-cicekli-sutun.webp"] },
    });
    // Ana sayfa ayarları kaydedilmişse ve hâlâ çizim görseller kullanılıyorsa fotoğraflarla değiştir
    const home = await prisma.siteSetting.findUnique({ where: { key: "home" } });
    if (home && typeof home.value === "object" && home.value) {
      const v = { ...(home.value as Record<string, unknown>) };
      if (String(v.heroImage ?? "").startsWith("/art/")) v.heroImage = "/photos/kus-mumlar.webp";
      if (String(v.storyImage ?? "").startsWith("/art/")) v.storyImage = "/photos/atolye-deniz-kizi.webp";
      await prisma.siteSetting.update({ where: { key: "home" }, data: { value: v as unknown as import("@prisma/client").Prisma.InputJsonValue } });
    }
    await prisma.siteSetting.create({ data: { key: "migration_catalog_v2", value: { at: new Date().toISOString() } } });
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
        coverImageUrl: "/photos/tarot-gunes.webp",
        gallery: ["/photos/atolye-deniz-kizi.webp", "/photos/kuru-cicekli-sutun.webp"],
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

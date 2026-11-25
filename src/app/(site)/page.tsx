import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { hasDatabase } from "@/lib/demo";
import { getCategories, getFeaturedProducts, getUpcomingWorkshops } from "@/lib/catalog";
import { getSettings, mapsEmbedUrl, mapsLink } from "@/lib/settings";
import { toParagraphs } from "@/lib/text";
import { whatsappLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/site/ProductCard";
import { WorkshopCard } from "@/components/site/WorkshopCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { t } from "@/i18n";
import { FaqSection, HowToOrder, TrustBar } from "@/components/site/InfoSections";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSettings(["seo"]);
  return { description: seo.homeDescription, alternates: { canonical: "/" } };
}

// Hero'da yükselen ışık zerreleri (sabit değerler: sunucu/istemci aynı çıktıyı üretir)
const EMBERS = [
  { left: "18%", t: "7s", delay: "0s", dx: "18px", size: 5 },
  { left: "32%", t: "9s", delay: "1.6s", dx: "-22px", size: 4 },
  { left: "44%", t: "6.5s", delay: "3.1s", dx: "12px", size: 6 },
  { left: "53%", t: "8s", delay: "0.8s", dx: "-10px", size: 4 },
  { left: "61%", t: "7.5s", delay: "2.4s", dx: "26px", size: 5 },
  { left: "70%", t: "10s", delay: "4s", dx: "-16px", size: 3 },
  { left: "78%", t: "8.5s", delay: "1.1s", dx: "14px", size: 5 },
  { left: "86%", t: "9.5s", delay: "3.6s", dx: "-24px", size: 4 },
];

const OCCASIONS = ["Doğum günü", "Öğretmenler Günü", "Söz & nişan", "Yeni ev", "Anneler Günü", "Sevgililer Günü", "Kurumsal hediye", "Baby shower"];

export default async function HomePage() {
  const [settings, products, categories, workshops, testimonials] = await Promise.all([
    getSettings(["home", "business", "hours", "instagram"]),
    getFeaturedProducts(8),
    getCategories(),
    getUpcomingWorkshops(2),
    hasDatabase
      ? prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 6 })
      : Promise.resolve([]),
  ]);
  const { home, business, hours, instagram } = settings;
  const wa = whatsappLink(business.whatsapp, "Merhaba MuMê, kişiye özel mum hakkında bilgi almak istiyorum.");
  const titleParts = home.heroTitle.split(",").map((p) => p.trim()).filter(Boolean);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgb(238_208_148/0.55),transparent_65%)]" />
        <div className="container-page relative grid items-center gap-10 pb-16 pt-8 md:grid-cols-12 md:pb-24 md:pt-14">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="eyebrow hero-fade mb-5" style={{ ["--d" as string]: "0.05s" }}>
              {home.heroEyebrow}
            </p>
            <h1 className="text-[2.9rem] font-medium leading-[0.98] sm:text-6xl lg:text-7xl">
              {titleParts.map((part, i) => (
                <span key={i} className="hero-line" style={{ ["--i" as string]: i }}>
                  <span className={i === titleParts.length - 1 && titleParts.length > 1 ? "italic text-terracotta" : ""}>
                    {part}
                    {i < titleParts.length - 1 ? "," : ""}
                  </span>
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-ink/80 md:text-lg" style={{ ["--d" as string]: "0.45s" }}>
              {home.heroText}
            </p>
            <div className="hero-fade mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "0.65s" }}>
              <Link href="/urunler" className="btn-primary">
                {t.cta.explore}
              </Link>
              <Link href="/workshoplar" className="btn-outline">
                {t.cta.joinWorkshop}
              </Link>
            </div>
          </div>
          <div className="relative md:col-span-6 lg:col-span-7">
            <div className="hero-fade relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] md:aspect-[5/6] lg:aspect-[3/2]" style={{ ["--d" as string]: "0.2s" }}>
              <div className="kenburns absolute inset-0">
                <Image src={home.heroImage} alt={home.heroImageAlt} fill priority sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 via-transparent to-transparent" />
              {EMBERS.map((e, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="ember"
                  style={{
                    left: e.left,
                    width: e.size,
                    height: e.size,
                    ["--t" as string]: e.t,
                    ["--delay" as string]: e.delay,
                    ["--dx" as string]: e.dx,
                  }}
                />
              ))}
            </div>
            <Link
              href="/urunler?kategori=cicek-tasarimli-mumlar"
              className="hero-fade absolute -right-3 top-8 hidden w-40 rounded-2xl bg-ivory/95 p-2 shadow-[var(--shadow-lift)] backdrop-blur transition hover:-translate-y-1 lg:block xl:-right-8"
              style={{ ["--d" as string]: "0.9s" }}
            >
              <span className="relative block aspect-square overflow-hidden rounded-xl">
                <Image src="/photos/cicek-bahcesi-kase.webp" alt="" fill sizes="160px" className="object-cover" />
              </span>
              <span className="block px-1 pb-1 pt-2 text-xs font-semibold text-espresso">Çiçekli kase mumlar →</span>
            </Link>
            <div className="float-slow absolute -bottom-6 left-4 hidden rounded-2xl bg-ivory/95 px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur sm:block md:-left-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-espresso">
                <span className="flicker inline-block h-2.5 w-2.5 rounded-full bg-flame shadow-[0_0_12px_4px_rgb(238_208_148/0.8)]" />
                Elde dökülür, özenle paketlenir
              </p>
              <p className="mt-1 text-xs text-ink/60">
                {business.city} · {business.instagramHandle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* KATEGORİLER */}
      {categories.length > 0 && (
        <section aria-labelledby="kategoriler" className="border-y border-sand bg-cream/60 py-6">
          <h2 id="kategoriler" className="sr-only">
            Kategoriler
          </h2>
          <div className="container-page">
            <ul data-stagger="70" data-stagger-type="fade" className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
              {categories.map((c) => (
                <li key={c.id} className="flex-none">
                  <Link
                    href={`/urunler?kategori=${c.slug}`}
                    className="block rounded-full border border-beige bg-ivory px-5 py-2.5 text-sm font-medium text-espresso transition hover:-translate-y-0.5 hover:border-terracotta hover:text-terracotta hover:shadow-[var(--shadow-soft)]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ÖNE ÇIKAN ÜRÜNLER */}
      <section className="container-page py-20 md:py-28">
        <div data-reveal="up">
          <SectionHeading eyebrow="Koleksiyon" title="Atölyeden yeni çıkanlar" text="Her biri elde dökülen, birbirinden biraz farklı mumlar." action={{ href: "/urunler", label: t.cta.viewAll }} />
        </div>
        {products.length ? (
          <div data-stagger="90" className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        ) : (
          <p className="text-ink/60">Ürünler çok yakında burada.</p>
        )}
      </section>

      {/* HEDİYE BANDI */}
      <section className="grain relative overflow-hidden bg-olive text-cream">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(238_208_148/0.35),transparent_65%)]" />
        <div className="container-page relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div data-reveal="left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-flame">Kişiye özel</p>
            <h2 className="text-4xl text-cream md:text-5xl">{home.giftTitle}</h2>
            <p className="mt-5 max-w-lg leading-relaxed text-cream/80">{home.giftText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/urunler?kategori=kisiye-ozel-mumlar" className="btn bg-cream px-6 py-3 text-espresso hover:bg-flame">
                Kişiye Özel Mumlar
              </Link>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-cream/40 px-6 py-3 text-cream hover:bg-cream/10">
                  WhatsApp&apos;tan Sor
                </a>
              )}
            </div>
          </div>
          <div data-reveal="zoom" className="relative">
            <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)]" data-parallax="0.06">
              <Image src="/photos/papatya-kase.webp" alt="Papatya buketi kase mum" fill sizes="(max-width: 768px) 90vw, 384px" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="marquee relative border-t border-cream/15 py-5" aria-hidden>
          <div className="marquee-track">
            {[...OCCASIONS, ...OCCASIONS].map((o, i) => (
              <span key={i} className="flex items-center gap-12 whitespace-nowrap font-serif text-2xl italic text-cream/85 md:text-3xl">
                {o} <span className="h-1.5 w-1.5 rounded-full bg-flame" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <HowToOrder />

      {/* WORKSHOPLAR */}
      <section className="container-page py-20 md:py-28">
        <div data-reveal="up">
          <SectionHeading
            eyebrow="Mum yapım workshopları"
            title="Kendi mumunu tasarla"
            text="Sıcak bir atölye ortamında, adım adım kendi mumunuzu döküyor ve süslüyorsunuz."
            action={{ href: "/workshoplar", label: "Tüm workshoplar" }}
          />
        </div>
        {workshops.length ? (
          <div className="space-y-8">
            {workshops.map((w) => (
              <div key={w.id} data-reveal="up">
                <WorkshopCard workshop={w} />
              </div>
            ))}
          </div>
        ) : (
          <div data-reveal="up" className="card p-10 text-center">
            <p className="font-serif text-2xl">Yeni workshop tarihleri çok yakında.</p>
            <p className="mt-2 text-ink/70">Duyurular için Instagram hesabımızı takip edin.</p>
          </div>
        )}
      </section>

      {/* HİKÂYE — gece, mum ışığı */}
      <section className="grain relative overflow-hidden bg-espresso py-20 text-cream md:py-28">
        <div className="container-page relative grid items-center gap-12 md:grid-cols-2">
          <div data-reveal="zoom" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-25px_rgb(0_0_0/0.7)]">
            <div className="absolute -inset-[8%]" data-parallax="0.08">
              <Image src={home.storyImage} alt="Mum ışığında MuMê atölyesi" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div data-reveal="right">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-flame">Hikâyemiz</p>
            <h2 className="text-4xl leading-tight text-cream md:text-5xl">{home.storyTitle}</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-cream/80">
              {toParagraphs(home.storyText).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link href="/hakkimizda" className="btn mt-8 border border-cream/35 px-6 py-3 text-cream hover:bg-cream/10">
              Bizi Tanıyın
            </Link>
          </div>
        </div>
      </section>

      {/* YORUMLAR — yalnızca yayınlanmış gerçek yorum varsa görünür */}
      {testimonials.length > 0 && (
        <section className="container-page py-20 md:py-28">
          <div data-reveal="up">
            <SectionHeading eyebrow="Sizden gelenler" title="Mum ışığında güzel sözler" align="center" />
          </div>
          <div data-stagger="120" className="grid gap-6 md:grid-cols-3">
            {testimonials.map((tm) => (
              <figure key={tm.id} className="card p-7">
                <blockquote className="font-serif text-xl italic leading-relaxed text-espresso">“{tm.text}”</blockquote>
                <figcaption className="mt-4 text-sm text-ink/70">
                  — {tm.authorName}
                  {tm.source ? <span className="text-ink/45"> · {tm.source}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <FaqSection />

      {/* INSTAGRAM */}
      <section className="container-page py-20 md:py-24">
        <div data-reveal="up">
          <SectionHeading
            eyebrow="Instagram"
            title={business.instagramHandle}
            text="Atölyeden kareler, yeni tasarımlar ve workshop anları."
            action={{ href: business.instagramUrl, label: "Instagram'da takip et" }}
          />
        </div>
        {instagram.posts.length ? (
          <div data-stagger="60" data-stagger-type="zoom" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {instagram.posts.slice(0, 12).map((p, i) => (
              <a key={i} href={p.url || business.instagramUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl bg-sand">
                <Image src={p.image} alt={p.alt || "MuMê Instagram gönderisi"} fill sizes="(max-width: 640px) 50vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </a>
            ))}
          </div>
        ) : (
          <a
            data-reveal="zoom"
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex flex-col items-center gap-3 overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-cream via-sand to-[#e8c9a6] p-12 text-center shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)]"
          >
            <span className="font-serif text-4xl italic text-espresso">{business.instagramHandle}</span>
            <span className="text-sm text-ink/70">Son paylaşımlarımızı görmek için Instagram&apos;ı ziyaret edin →</span>
          </a>
        )}
      </section>

      {/* İLETİŞİM & KONUM */}
      <section className="container-page pb-4">
        <div data-reveal="up" className="card grid overflow-hidden md:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="eyebrow mb-4">Atölyeye uğrayın</p>
            <h2 className="text-4xl">Van&apos;da, mum kokulu bir köşe</h2>
            <address className="mt-6 not-italic leading-relaxed text-ink/80">
              {business.addressLine}
              <br />
              {[business.district, business.city].filter(Boolean).join(" / ")}
            </address>
            <ul className="mt-6 space-y-1 text-sm text-ink/80">
              {hours.days.map((d) => (
                <li key={d.day} className="flex max-w-xs justify-between">
                  <span>{d.day}</span>
                  <span>{d.closed ? "Kapalı" : `${d.open} – ${d.close}`}</span>
                </li>
              ))}
            </ul>
            {hours.note && <p className="mt-3 text-xs text-ink/55">{hours.note}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={mapsLink(business.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Yol Tarifi
              </a>
              <Link href="/iletisim" className="btn-outline">
                İletişim
              </Link>
            </div>
          </div>
          <iframe
            title="MuMê Mum Atölyesi konumu"
            src={mapsEmbedUrl(business.mapsQuery)}
            className="h-80 w-full border-0 md:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}

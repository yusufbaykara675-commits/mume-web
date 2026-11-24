import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { demoWorkshops, hasDatabase } from "@/lib/demo";
import { seatsTakenBySession, type WorkshopWithSeats } from "@/lib/catalog";
import { formatDuration, formatPrice } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { toParagraphs } from "@/lib/text";
import { workshopEventsJsonLd } from "@/lib/seo";
import { ReservationForm } from "@/components/forms/ReservationForm";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";

type Params = Promise<{ slug: string }>;

async function getWorkshop(slug: string): Promise<WorkshopWithSeats | null> {
  if (!hasDatabase) {
    const d = demoWorkshops.find((x) => x.slug === slug);
    return d ? { ...d, sessions: [] } : null;
  }
  const w = await prisma.workshop.findFirst({
    where: { slug, isActive: true },
    include: { sessions: { where: { isActive: true, startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" } } },
  });
  if (!w) return null;
  const taken = await seatsTakenBySession(w.sessions.map((s) => s.id));
  return { ...w, sessions: w.sessions.map((s) => ({ ...s, seatsLeft: Math.max(0, s.capacity - (taken.get(s.id) ?? 0)) })) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWorkshop(slug);
  if (!w) return { title: "Workshop bulunamadı" };
  const description = (w.shortDescription || w.description).slice(0, 160);
  return {
    title: w.title,
    description,
    alternates: { canonical: `/workshoplar/${w.slug}` },
    openGraph: { title: w.title, description, url: `${SITE_URL}/workshoplar/${w.slug}`, images: w.coverImageUrl ? [{ url: w.coverImageUrl }] : undefined },
  };
}

export default async function WorkshopDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const w = await getWorkshop(slug);
  if (!w) notFound();
  const business = await getSetting("business");
  const gallery = [w.coverImageUrl, ...w.gallery].filter(Boolean) as string[];

  return (
    <div className="container-page py-8 md:py-14">
      <nav aria-label="Sayfa konumu" className="mb-6 text-xs text-ink/60">
        <Link href="/workshoplar" className="hover:text-terracotta">← Tüm workshoplar</Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-12">
        <div data-reveal="up" className="lg:col-span-7">
          <p className="eyebrow mb-3">Workshop</p>
          <h1 className="text-4xl leading-tight md:text-6xl">{w.title}</h1>
          {w.shortDescription && <p className="mt-5 text-lg leading-relaxed text-ink/80">{w.shortDescription}</p>}

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4">
              <dt className="text-xs text-ink/55">Süre</dt>
              <dd className="mt-1 font-semibold">{formatDuration(w.durationMinutes)}</dd>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <dt className="text-xs text-ink/55">Kişi başı ücret</dt>
              <dd className="mt-1 font-semibold">{formatPrice(w.priceCents, "Ücret için yazın")}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-cream p-4 sm:col-span-1">
              <dt className="text-xs text-ink/55">Yer</dt>
              <dd className="mt-1 font-semibold">{business.city}, atölyemiz</dd>
            </div>
          </dl>

          {gallery.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3">
              {gallery.slice(0, 5).map((src, i) => (
                <div key={src + i} className={`relative overflow-hidden rounded-2xl bg-sand ${i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}>
                  <Image src={src} alt={`${w.title} — fotoğraf ${i + 1}`} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" priority={i === 0} />
                </div>
              ))}
            </div>
          )}

          <div className="prose-mume mt-10">
            <h2>Workshop hakkında</h2>
            {toParagraphs(w.description).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {w.includes.length > 0 && (
              <>
                <h2>Neler dahil?</h2>
                <ul>
                  {w.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside data-reveal="right" className="lg:col-span-5">
          <div className="card p-6 md:p-8 lg:sticky lg:top-28" id="rezervasyon">
            <h2 className="text-3xl">Yerinizi ayırtın</h2>
            {w.sessions.length ? (
              <ReservationForm
                priceCents={w.priceCents}
                sessions={w.sessions.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString(), seatsLeft: s.seatsLeft, note: s.note }))}
              />
            ) : (
              <p className="mt-4 text-ink/70">
                Bu workshop için şu an açık tarih bulunmuyor. Yeni tarihler için Instagram hesabımızı takip edebilir veya{" "}
                <Link href="/iletisim" className="text-terracotta underline">bize yazabilirsiniz</Link>.
              </p>
            )}
          </div>
        </aside>
      </div>

      {w.sessions.length > 0 && (
        <JsonLd
          data={workshopEventsJsonLd({
            title: w.title,
            slug: w.slug,
            description: w.shortDescription || w.description,
            image: w.coverImageUrl,
            durationMinutes: w.durationMinutes,
            priceCents: w.priceCents,
            sessions: w.sessions,
            business,
          })}
        />
      )}
    </div>
  );
}

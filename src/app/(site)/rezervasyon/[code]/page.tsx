import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasDatabase } from "@/lib/demo";
import { formatDateTime, formatDuration, formatPrice } from "@/lib/format";
import { getSettings, mapsLink } from "@/lib/settings";
import { RESERVATION_STATUS_LABELS } from "@/lib/site";
import { buildReservationMessage, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Rezervasyon", robots: { index: false, follow: false } };

type Params = Promise<{ code: string }>;

export default async function ReservationConfirmationPage({ params }: { params: Params }) {
  const { code } = await params;
  if (!hasDatabase) notFound();
  if (!/^MW-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) notFound();
  const r = await prisma.reservation.findUnique({
    where: { code },
    include: { session: { include: { workshop: true } } },
  });
  if (!r) notFound();
  const { business } = await getSettings(["business"]);
  const w = r.session.workshop;
  const wa = whatsappLink(
    business.whatsapp,
    buildReservationMessage({ code: r.code, workshopTitle: w.title, startsAt: r.session.startsAt, participants: r.participants, fullName: r.fullName }),
  );
  const firstName = r.fullName.split(" ")[0];
  const statusTone =
    r.status === "ONAYLANDI" ? "bg-sage/20 text-olive" : r.status === "BEKLIYOR" ? "bg-flame/40 text-brown" : "bg-terracotta/15 text-[#8a3d14]";

  return (
    <div className="container-page py-12 md:py-20">
      <div className="card mx-auto max-w-xl p-8 md:p-12">
        <p className="eyebrow mb-3">Rezervasyon</p>
        <h1 className="text-4xl">
          {r.status === "BEKLIYOR" ? `Teşekkürler ${firstName}, talebiniz alındı` : `Merhaba ${firstName}`}
        </h1>
        <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
          {RESERVATION_STATUS_LABELS[r.status]}
        </span>

        <dl className="mt-8 divide-y divide-sand text-sm">
          {[
            ["Rezervasyon no", r.code],
            ["Workshop", w.title],
            ["Tarih ve saat", formatDateTime(r.session.startsAt)],
            ["Süre", formatDuration(w.durationMinutes)],
            ["Kişi sayısı", `${r.participants} kişi`],
            ["Toplam ücret", w.priceCents === null ? "Onayda bildirilecek" : formatPrice(w.priceCents * r.participants)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-ink/60">{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {r.status === "BEKLIYOR" && (
          <p className="mt-6 text-sm leading-relaxed text-ink/75">
            Yeriniz onay sürecinde sizin için ayrıldı. Rezervasyonunuzu kontrol edip verdiğiniz telefon numarası üzerinden onay ve ödeme
            bilgisini ileteceğiz. Daha hızlı onay için talebinizi WhatsApp&apos;tan da gönderebilirsiniz.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {wa && r.status === "BEKLIYOR" && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
              WhatsApp ile Onay İste
            </a>
          )}
          <a href={mapsLink(business.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
            Atölye konumu
          </a>
          <Link href="/" className="text-center text-sm text-ink/60 hover:text-terracotta">
            Ana sayfaya dön
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink/50">Bu sayfanın adresini saklayarak rezervasyon durumunuzu daha sonra da görebilirsiniz.</p>
      </div>
    </div>
  );
}

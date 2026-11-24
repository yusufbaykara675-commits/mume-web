import Link from "next/link";
import type { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDateTime, formatShortDateTime } from "@/lib/format";
import { RESERVATION_STATUS_LABELS } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { updateReservation } from "@/actions/admin/operations";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { Badge, Empty, PageHeader, reservationTone } from "@/components/admin/ui";

export const metadata = { title: "Rezervasyonlar" };

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ durum?: string; q?: string; zaman?: string }> }) {
  const { durum, q, zaman } = await searchParams;
  const status = durum && durum in RESERVATION_STATUS_LABELS ? (durum as ReservationStatus) : undefined;
  const upcomingOnly = zaman !== "tumu";
  const reservations = await prisma.reservation.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(upcomingOnly ? { session: { startsAt: { gt: new Date(Date.now() - 86400000) } } } : {}),
      ...(q ? { OR: [{ code: { contains: q, mode: "insensitive" } }, { fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : {}),
    },
    include: { session: { include: { workshop: { select: { title: true } } } } },
    orderBy: [{ session: { startsAt: "asc" } }, { createdAt: "asc" }],
    take: 300,
  });

  const filterHref = (d?: string) => {
    const p = new URLSearchParams();
    if (d) p.set("durum", d);
    if (!upcomingOnly) p.set("zaman", "tumu");
    return `/yonetim/rezervasyonlar${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div>
      <PageHeader title="Rezervasyonlar" text="Onay bekleyen talepleri onaylayın veya reddedin. Reddedilen/iptal edilen talepler kapasiteyi boşaltır." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={filterHref()} className={`rounded-full px-4 py-1.5 text-sm ${!status ? "bg-espresso text-ivory" : "bg-white"}`}>Tümü</Link>
        {Object.entries(RESERVATION_STATUS_LABELS).map(([k, v]) => (
          <Link key={k} href={filterHref(k)} className={`rounded-full px-4 py-1.5 text-sm ${status === k ? "bg-espresso text-ivory" : "bg-white"}`}>{v}</Link>
        ))}
      </div>
      <form className="mb-5 flex flex-wrap items-center gap-3">
        {status && <input type="hidden" name="durum" value={status} />}
        <input name="q" defaultValue={q} placeholder="Rezervasyon no, isim, telefon…" className="input max-w-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="zaman" value="tumu" defaultChecked={!upcomingOnly} className="accent-terracotta" /> Geçmiş tarihler dahil
        </label>
        <button className="btn-outline px-4! py-2!">Filtrele</button>
      </form>

      {reservations.length ? (
        <ul className="space-y-3">
          {reservations.map((r) => {
            const msg =
              r.status === "ONAYLANDI"
                ? `Merhaba ${r.fullName.split(" ")[0]}, MuMê'den yazıyoruz. ${r.session.workshop.title} (${formatDateTime(r.session.startsAt)}) için ${r.participants} kişilik rezervasyonunuz onaylandı. Rezervasyon no: ${r.code}`
                : `Merhaba ${r.fullName.split(" ")[0]}, MuMê'den yazıyoruz. ${r.code} numaralı rezervasyonunuz hakkında:`;
            const wa = whatsappLink(r.phone, msg);
            return (
              <li key={r.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-espresso">
                      {r.fullName} · {r.participants} kişi
                    </p>
                    <p className="text-sm text-ink/70">{r.session.workshop.title} — {formatShortDateTime(r.session.startsAt)}</p>
                    <p className="text-xs text-ink/55">
                      {r.code} · {r.phone}
                      {r.email ? ` · ${r.email}` : ""} · talep: {formatShortDateTime(r.createdAt)}
                    </p>
                    {r.note && <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-sm">“{r.note}”</p>}
                  </div>
                  <Badge tone={reservationTone(r.status)}>{RESERVATION_STATUS_LABELS[r.status]}</Badge>
                </div>
                <AdminForm action={updateReservation} className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                  <input type="hidden" name="id" value={r.id} />
                  <label className="block">
                    <span className="label">Durum</span>
                    <select name="status" defaultValue={r.status} className="input">
                      {Object.entries(RESERVATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label">İç not</span>
                    <input name="adminNote" defaultValue={r.adminNote ?? ""} className="input" />
                  </label>
                  <SubmitButton variant="outline">Güncelle</SubmitButton>
                </AdminForm>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-[#1f7a4d] hover:underline">
                    {r.status === "ONAYLANDI" ? "Onay mesajını WhatsApp'tan gönder →" : "Müşteriye WhatsApp'tan yaz →"}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>Bu filtreye uygun rezervasyon yok.</Empty>
      )}
    </div>
  );
}

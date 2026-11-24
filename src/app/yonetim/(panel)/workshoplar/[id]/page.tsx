import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { dateToIstanbulInput, formatShortDateTime } from "@/lib/format";
import { RESERVATION_STATUS_LABELS, SEAT_HOLDING_STATUSES } from "@/lib/site";
import { deleteSession, deleteWorkshop, removeWorkshopImage, saveSession } from "@/actions/admin/workshops";
import { WorkshopForm } from "@/components/admin/WorkshopForm";
import { AdminForm, ConfirmSubmit, SubmitButton } from "@/components/admin/AdminForm";
import { Badge, Checkbox, Input, Notice, PageHeader, Panel, reservationTone } from "@/components/admin/ui";

export const metadata = { title: "Workshop düzenle" };

export default async function EditWorkshopPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string; gecmis?: string }>;
}) {
  const { id } = await params;
  const { kaydedildi, gecmis } = await searchParams;
  const now = new Date();
  const w = await prisma.workshop.findUnique({
    where: { id },
    include: {
      sessions: {
        where: gecmis ? undefined : { startsAt: { gt: new Date(now.getTime() - 86400000) } },
        orderBy: { startsAt: "asc" },
        include: { reservations: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!w) notFound();

  return (
    <div>
      <div className="mb-4 text-sm">
        <Link href="/yonetim/workshoplar" className="text-ink/60 hover:text-terracotta">← Workshoplar</Link>
      </div>
      <PageHeader title={w.title} />
      {kaydedildi && <Notice>✓ Workshop kaydedildi.</Notice>}
      {w.isSample && <Notice tone="amber">Bu bir örnek workshop. Bilgileri güncelleyip kaydedin; tarihleri “Yayında” işaretleyerek rezervasyona açın.</Notice>}

      {/* TARİHLER */}
      <Panel title="Tarihler ve kapasite" className="mb-6">
        <AdminForm action={saveSession} resetOnSuccess className="mb-6 grid gap-4 rounded-xl bg-cream/60 p-4 sm:grid-cols-[1.3fr_100px_1fr_auto] sm:items-end">
          <input type="hidden" name="workshopId" value={w.id} />
          <input type="hidden" name="isActive" value="on" />
          <Input label="Yeni tarih ve saat" name="startsAt" type="datetime-local" required />
          <Input label="Kapasite" name="capacity" type="number" min={1} max={200} defaultValue={8} required />
          <Input label="Not (isteğe bağlı)" name="note" placeholder="Örn: Anneler Günü özel" />
          <SubmitButton>Tarih ekle</SubmitButton>
        </AdminForm>

        {w.sessions.length ? (
          <ul className="space-y-4">
            {w.sessions.map((s) => {
              const booked = s.reservations.filter((r) => (SEAT_HOLDING_STATUSES as readonly string[]).includes(r.status)).reduce((a, r) => a + r.participants, 0);
              const past = s.startsAt <= now;
              return (
                <li key={s.id} className="rounded-xl border border-sand p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {formatShortDateTime(s.startsAt)} {past && <Badge>Geçmiş</Badge>} {!s.isActive && <Badge tone="gray">Yayında değil</Badge>}
                    </p>
                    <p className="text-sm">
                      <strong>{booked}</strong>/{s.capacity} dolu · <span className="text-sage">{Math.max(0, s.capacity - booked)} boş</span>
                    </p>
                  </div>
                  <AdminForm action={saveSession} className="grid gap-3 sm:grid-cols-[1.3fr_100px_1fr_auto_auto] sm:items-end">
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="workshopId" value={w.id} />
                    <Input label="Tarih" name="startsAt" type="datetime-local" defaultValue={dateToIstanbulInput(s.startsAt)} required />
                    <Input label="Kapasite" name="capacity" type="number" min={1} defaultValue={s.capacity} required />
                    <Input label="Not" name="note" defaultValue={s.note ?? ""} />
                    <div className="pb-3"><Checkbox name="isActive" label="Yayında" defaultChecked={s.isActive} /></div>
                    <SubmitButton variant="outline">Kaydet</SubmitButton>
                  </AdminForm>
                  {s.reservations.length > 0 ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-terracotta">{s.reservations.length} rezervasyon</summary>
                      <ul className="mt-2 divide-y divide-sand text-sm">
                        {s.reservations.map((r) => (
                          <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                            <span>{r.fullName} · {r.participants} kişi · {r.phone}</span>
                            <Link href={`/yonetim/rezervasyonlar?q=${r.code}`}><Badge tone={reservationTone(r.status)}>{RESERVATION_STATUS_LABELS[r.status]}</Badge></Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <AdminForm action={deleteSession} className="mt-2">
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmSubmit message="Bu tarih silinsin mi?">Tarihi sil</ConfirmSubmit>
                    </AdminForm>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink/60">Henüz tarih eklenmedi.</p>
        )}
        <p className="mt-4 text-xs">
          <Link href={gecmis ? `/yonetim/workshoplar/${w.id}` : `/yonetim/workshoplar/${w.id}?gecmis=1`} className="text-ink/60 underline">
            {gecmis ? "Yalnızca yaklaşan tarihleri göster" : "Geçmiş tarihleri de göster"}
          </Link>
        </p>
      </Panel>

      {w.gallery.length > 0 && (
        <Panel title="Galeri" className="mb-6">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {w.gallery.map((g) => (
              <li key={g}>
                <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">
                  <Image src={g} alt="" fill sizes="150px" className="object-cover" />
                </div>
                <form action={removeWorkshopImage} className="mt-1 text-center">
                  <input type="hidden" name="id" value={w.id} />
                  <input type="hidden" name="url" value={g} />
                  <ConfirmSubmit message="Bu fotoğraf kaldırılsın mı?" className="text-xs">Kaldır</ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <WorkshopForm workshop={w} />

      <Panel title="Workshop'u sil" className="mt-10">
        <AdminForm action={deleteWorkshop}>
          <input type="hidden" name="id" value={w.id} />
          <p className="text-sm text-ink/70">Rezervasyonu olan workshoplar silinemez; yayından kaldırabilirsiniz.</p>
          <ConfirmSubmit message={`"${w.title}" kalıcı olarak silinsin mi?`}>Kalıcı olarak sil</ConfirmSubmit>
        </AdminForm>
      </Panel>
    </div>
  );
}

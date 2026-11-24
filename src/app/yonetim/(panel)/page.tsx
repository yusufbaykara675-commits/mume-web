import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { formatPrice, formatShortDateTime } from "@/lib/format";
import { ORDER_STATUS_LABELS, RESERVATION_STATUS_LABELS, SEAT_HOLDING_STATUSES } from "@/lib/site";
import { Badge, Notice, Panel, orderTone, reservationTone } from "@/components/admin/ui";

export const metadata = { title: "Genel Bakış" };

export default async function DashboardPage() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const [
    newOrders,
    orders30,
    confirmedSales,
    pendingRes,
    unread,
    sampleProducts,
    sampleWorkshops,
    recentOrders,
    recentRes,
    upcoming,
    business,
    paidSales,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "YENI" } }),
    prisma.order.count({ where: { createdAt: { gte: d30 } } }),
    prisma.order.aggregate({ where: { status: { in: ["ONAYLANDI", "HAZIRLANIYOR", "KARGODA", "TAMAMLANDI"] }, createdAt: { gte: d30 } }, _sum: { totalCents: true }, _count: true }),
    prisma.reservation.count({ where: { status: "BEKLIYOR" } }),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.product.count({ where: { isSample: true } }),
    prisma.workshop.count({ where: { isSample: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.reservation.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { session: { include: { workshop: { select: { title: true } } } } } }),
    prisma.workshopSession.findMany({
      where: { startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { workshop: { select: { title: true, id: true } }, reservations: { where: { status: { in: [...SEAT_HOLDING_STATUSES] } }, select: { participants: true } } },
    }),
    getSetting("business"),
    prisma.order.aggregate({ where: { paymentStatus: "ODENDI", createdAt: { gte: d30 } }, _sum: { totalCents: true } }),
  ]);

  const stats = [
    { label: "Yeni sipariş", value: newOrders, href: "/yonetim/siparisler?durum=YENI" },
    { label: "Onay bekleyen rezervasyon", value: pendingRes, href: "/yonetim/rezervasyonlar?durum=BEKLIYOR" },
    { label: "Okunmamış mesaj", value: unread, href: "/yonetim/mesajlar" },
    { label: "Son 30 gün sipariş", value: orders30, href: "/yonetim/siparisler" },
  ];

  return (
    <div>
      <h1 className="mb-2 text-4xl">Hoş geldiniz 🕯️</h1>
      <p className="mb-8 text-sm text-ink/65">Atölyenizin güncel durumu</p>

      {!business.whatsapp && (
        <Notice tone="amber">
          WhatsApp numarası henüz girilmedi; müşteriler siparişlerini WhatsApp&apos;a aktaramaz.{" "}
          <Link href="/yonetim/icerik" className="font-semibold underline">İşletme bilgilerinden ekleyin →</Link>
        </Notice>
      )}
      {(sampleProducts > 0 || sampleWorkshops > 0) && (
        <Notice tone="amber">
          Sitede {sampleProducts > 0 && `${sampleProducts} örnek ürün`}
          {sampleProducts > 0 && sampleWorkshops > 0 && " ve "}
          {sampleWorkshops > 0 && `${sampleWorkshops} örnek workshop`} bulunuyor. Yayına almadan önce gerçek bilgi ve fotoğraflarla güncelleyin
          ya da silin.
        </Notice>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5 transition hover:ring-terracotta/40">
            <p className="font-serif text-4xl text-espresso">{s.value}</p>
            <p className="mt-1 text-xs text-ink/60">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-olive p-5 text-cream">
          <p className="text-xs uppercase tracking-wider text-cream/70">Son 30 gün onaylanan siparişler</p>
          <p className="mt-1 font-serif text-3xl">{formatPrice(confirmedSales._sum.totalCents ?? 0)}</p>
          <p className="text-xs text-cream/70">{confirmedSales._count} sipariş · fiyatı girilmiş ürünler üzerinden</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
          <p className="text-xs uppercase tracking-wider text-ink/55">Son 30 gün “ödendi” işaretli</p>
          <p className="mt-1 font-serif text-3xl text-espresso">{formatPrice(paidSales._sum.totalCents ?? 0)}</p>
          <p className="text-xs text-ink/55">Ödeme durumu sipariş detayından güncellenir</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Son siparişler">
          {recentOrders.length ? (
            <ul className="divide-y divide-sand">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/yonetim/siparisler/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-terracotta">
                    <span>
                      <span className="block font-semibold">{o.customerName}</span>
                      <span className="text-xs text-ink/55">{o.code} · {formatShortDateTime(o.createdAt)}</span>
                    </span>
                    <span className="text-right">
                      <Badge tone={orderTone(o.status)}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                      <span className="block text-xs text-ink/60">{formatPrice(o.totalCents)}{o.hasUnpricedItems ? "+" : ""}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Henüz sipariş yok.</p>
          )}
        </Panel>

        <Panel title="Son rezervasyon talepleri">
          {recentRes.length ? (
            <ul className="divide-y divide-sand">
              {recentRes.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="block font-semibold">{r.fullName} · {r.participants} kişi</span>
                    <span className="text-xs text-ink/55">{r.session.workshop.title} · {formatShortDateTime(r.session.startsAt)}</span>
                  </span>
                  <Badge tone={reservationTone(r.status)}>{RESERVATION_STATUS_LABELS[r.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Henüz rezervasyon yok.</p>
          )}
        </Panel>
      </div>

      <Panel title="Yaklaşan workshop tarihleri" className="mt-6">
        {upcoming.length ? (
          <ul className="divide-y divide-sand">
            {upcoming.map((s) => {
              const taken = s.reservations.reduce((a, r) => a + r.participants, 0);
              const pct = Math.min(100, Math.round((taken / s.capacity) * 100));
              return (
                <li key={s.id} className="py-3">
                  <Link href={`/yonetim/workshoplar/${s.workshop.id}`} className="flex items-center justify-between gap-4 text-sm hover:text-terracotta">
                    <span>
                      <span className="block font-semibold">{s.workshop.title}</span>
                      <span className="text-xs text-ink/55">
                        {formatShortDateTime(s.startsAt)} {!s.isActive && "· yayında değil"}
                      </span>
                    </span>
                    <span className="w-32 text-right text-xs">
                      {taken}/{s.capacity} dolu
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-sand">
                        <span className="block h-full bg-terracotta" style={{ width: `${pct}%` }} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink/60">Planlanmış workshop tarihi yok.</p>
        )}
      </Panel>
    </div>
  );
}

import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatPrice, formatShortDateTime } from "@/lib/format";
import { DELIVERY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/site";
import { Badge, Empty, PageHeader, orderTone } from "@/components/admin/ui";

export const metadata = { title: "Siparişler" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ durum?: string; q?: string }> }) {
  const { durum, q } = await searchParams;
  const status = durum && durum in ORDER_STATUS_LABELS ? (durum as OrderStatus) : undefined;
  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? { OR: [{ code: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
        : {}),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader title="Siparişler" text="Siteden gelen sipariş talepleri. Müşteri siparişi WhatsApp'tan da iletir; buradan durumunu takip edin." />
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/yonetim/siparisler" className={`rounded-full px-4 py-1.5 text-sm ${!status ? "bg-espresso text-ivory" : "bg-white"}`}>Tümü</Link>
        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
          <Link key={k} href={`/yonetim/siparisler?durum=${k}`} className={`rounded-full px-4 py-1.5 text-sm ${status === k ? "bg-espresso text-ivory" : "bg-white"}`}>
            {v}
          </Link>
        ))}
      </div>
      <form className="mb-5">
        {status && <input type="hidden" name="durum" value={status} />}
        <input name="q" defaultValue={q} placeholder="Sipariş no, isim veya telefon…" className="input max-w-sm" />
      </form>

      {orders.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-espresso/5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sand bg-cream/50 text-xs uppercase tracking-wider text-ink/55">
              <tr>
                <th className="px-4 py-3">Sipariş</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Teslimat</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Ödeme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/yonetim/siparisler/${o.id}`} className="font-semibold text-espresso hover:text-terracotta">{o.code}</Link>
                    <span className="block text-xs text-ink/55">{formatShortDateTime(o.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-xs text-ink/55">{o.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{DELIVERY_LABELS[o.deliveryMethod]}{o.city ? ` · ${o.city}` : ""}</td>
                  <td className="px-4 py-3">
                    {formatPrice(o.totalCents)}
                    {o.hasUnpricedItems && <span className="block text-xs text-terracotta">+ fiyatsız ürün</span>}
                  </td>
                  <td className="px-4 py-3"><Badge tone={orderTone(o.status)}>{ORDER_STATUS_LABELS[o.status]}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={o.paymentStatus === "ODENDI" ? "green" : "gray"}>{PAYMENT_STATUS_LABELS[o.paymentStatus]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Bu filtreye uygun sipariş yok.</Empty>
      )}
    </div>
  );
}

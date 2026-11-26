import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { DELIVERY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { updateOrder } from "@/actions/admin/operations";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { Badge, PageHeader, Panel, Textarea, orderTone } from "@/components/admin/ui";

export const metadata = { title: "Sipariş detayı" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: { select: { slug: true } } } } } });
  if (!order) notFound();
  const wa = whatsappLink(order.phone, `Merhaba ${order.customerName.split(" ")[0]}, MuMê'den yazıyoruz. ${order.code} numaralı siparişiniz hakkında:`);

  return (
    <div>
      <div className="mb-4 text-sm">
        <Link href="/yonetim/siparisler" className="text-ink/60 hover:text-terracotta">← Siparişler</Link>
      </div>
      <PageHeader title={`Sipariş ${order.code}`} text={formatDateTime(order.createdAt)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Ürünler">
            <ul className="divide-y divide-sand text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3">
                  <span>
                    <span className="font-semibold">{i.quantity} × </span>
                    {i.product ? <Link href={`/urunler/${i.product.slug}`} target="_blank" className="hover:text-terracotta">{i.productName}</Link> : i.productName}
                    {(i.color || i.fragrance) && <span className="block text-xs text-ink/55">{[i.color && `Renk: ${i.color}`, i.fragrance && `Koku: ${i.fragrance}`].filter(Boolean).join(" · ")}</span>}
                  </span>
                  <span className="text-right">{i.unitPriceCents === null ? <Badge tone="amber">Fiyat yok</Badge> : formatPrice(i.unitPriceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-sand pt-3 font-semibold">
              <span>Ara toplam</span>
              <span>{formatPrice(order.totalCents)}{order.hasUnpricedItems ? " + fiyatsız ürünler" : ""}</span>
            </div>
            <p className="mt-1 text-xs text-ink/55">Kargo ücreti dahil değildir. Stok, sipariş ilk kez onaylandığında düşülür{order.stockDeducted ? " (bu siparişte düşüldü)" : ""}.</p>
          </Panel>

          <Panel title="Müşteri">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-ink/55">Ad Soyad</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div><dt className="text-ink/55">Telefon</dt><dd className="font-semibold"><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
              {order.email && <div><dt className="text-ink/55">E-posta</dt><dd><a href={`mailto:${order.email}`}>{order.email}</a></dd></div>}
              <div><dt className="text-ink/55">Teslimat</dt><dd>{DELIVERY_LABELS[order.deliveryMethod]}</dd></div>
              {order.address && <div className="sm:col-span-2"><dt className="text-ink/55">Adres</dt><dd className="whitespace-pre-line">{order.address}{order.city ? `\n${order.city}` : ""}</dd></div>}
              {order.note && <div className="sm:col-span-2"><dt className="text-ink/55">Müşteri notu</dt><dd className="whitespace-pre-line rounded-lg bg-cream p-3">{order.note}</dd></div>}
              <div className="sm:col-span-2 text-xs text-ink/55">
                KVKK onayı: {order.kvkkConsent ? "Var" : "Yok"} (sürüm {order.consentTextVersion}) · Sözleşme onayı: {order.contractsConsent ? `Var (sürüm ${order.contractsVersion ?? "—"})` : "Yok"} · Duyuru izni: {order.marketingConsent ? "Var" : "Yok"}
              </div>
            </dl>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5 px-5! py-2.5!">Müşteriye WhatsApp&apos;tan yaz</a>}
          </Panel>
        </div>

        <Panel title="Durum">
          <div className="mb-4 flex gap-2">
            <Badge tone={orderTone(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            <Badge tone={order.paymentStatus === "ODENDI" ? "green" : "gray"}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
          </div>
          <AdminForm action={updateOrder}>
            <input type="hidden" name="id" value={order.id} />
            <label className="block">
              <span className="label">Sipariş durumu</span>
              <select name="status" defaultValue={order.status} className="input">
                {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Ödeme durumu</span>
              <select name="paymentStatus" defaultValue={order.paymentStatus} className="input">
                {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <span className="mt-1 block text-xs text-ink/55">Yalnızca ödemeyi (havale/EFT, elden) gerçekten aldığınızda “Ödendi” seçin.</span>
            </label>
            <Textarea label="İç not (müşteri görmez)" name="adminNote" rows={3} defaultValue={order.adminNote ?? ""} />
            <SubmitButton className="w-full">Güncelle</SubmitButton>
          </AdminForm>
        </Panel>
      </div>
    </div>
  );
}

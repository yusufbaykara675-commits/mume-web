import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { stockInfo } from "@/lib/stock";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Ürünler" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; silindi?: string }> }) {
  const { q, silindi } = await searchParams;
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <PageHeader title="Ürünler" text={`${products.length} ürün`} action={{ href: "/yonetim/urunler/yeni", label: "+ Yeni ürün" }} />
      {silindi && <Notice>Ürün silindi.</Notice>}
      <form className="mb-5">
        <input name="q" defaultValue={q} placeholder="Ürün ara…" className="input max-w-xs" />
      </form>
      {products.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-espresso/5">
          <ul className="divide-y divide-sand">
            {products.map((p) => {
              const s = stockInfo(p.stock);
              return (
                <li key={p.id}>
                  <Link href={`/yonetim/urunler/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-cream/50">
                    <div className="relative h-14 w-12 flex-none overflow-hidden rounded-lg bg-sand">
                      {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-espresso">{p.name}</p>
                      <p className="text-xs text-ink/55">{p.category?.name ?? "Kategorisiz"}</p>
                    </div>
                    <div className="hidden text-right text-sm sm:block">
                      <p className="font-semibold">{formatPrice(p.priceCents, "Fiyat yok")}</p>
                      <p className="text-xs text-ink/55">{p.stock === null ? "Siparişe özel" : `Stok: ${p.stock}`}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!p.isActive && <Badge tone="gray">Gizli</Badge>}
                      {p.isSample && <Badge tone="amber">Örnek</Badge>}
                      {p.isFeatured && <Badge tone="green">Öne çıkan</Badge>}
                      {s.tone === "out" && <Badge tone="red">Tükendi</Badge>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <Empty>Ürün bulunamadı.</Empty>
      )}
    </div>
  );
}

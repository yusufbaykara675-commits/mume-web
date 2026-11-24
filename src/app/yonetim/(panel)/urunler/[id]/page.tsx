import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteProduct, deleteProductImage, moveProductImage, updateImageAlt } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmSubmit } from "@/components/admin/AdminForm";
import { Badge, Notice, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Ürünü düzenle" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const { kaydedildi } = await searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-4 text-sm">
        <Link href="/yonetim/urunler" className="text-ink/60 hover:text-terracotta">← Ürünler</Link>
      </div>
      <PageHeader title={product.name} text={product.isActive ? "Yayında" : "Gizli"} />
      {kaydedildi && <Notice>✓ Ürün kaydedildi.</Notice>}
      {product.isSample && <Notice tone="amber">Bu bir örnek üründür. Bilgileri ve fotoğrafları güncelleyip kaydettiğinizde örnek işareti kalkar.</Notice>}
      <div className="mb-4 flex gap-4 text-sm">
        <Link href={`/urunler/${product.slug}`} target="_blank" className="font-medium text-terracotta">Sitede görüntüle ↗</Link>
      </div>

      <Panel title={`Mevcut fotoğraflar (${product.images.length})`} className="mb-6">
        {product.images.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.images.map((img, i) => (
              <li key={img.id} className="rounded-xl border border-sand p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                  <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2"><Badge tone="dark">Kapak</Badge></span>}
                </div>
                <form action={updateImageAlt} className="mt-2 flex gap-1">
                  <input type="hidden" name="imageId" value={img.id} />
                  <input name="alt" defaultValue={img.alt} placeholder="Görsel açıklaması" className="input px-2! py-1.5! text-xs!" aria-label="Görsel açıklaması (erişilebilirlik)" />
                  <button className="rounded-lg bg-sand px-2 text-xs">Kaydet</button>
                </form>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    <form action={moveProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button disabled={i === 0} className="rounded bg-sand px-2 py-1 disabled:opacity-40" aria-label="Sola taşı">←</button>
                    </form>
                    <form action={moveProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button disabled={i === product.images.length - 1} className="rounded bg-sand px-2 py-1 disabled:opacity-40" aria-label="Sağa taşı">→</button>
                    </form>
                  </div>
                  <form action={deleteProductImage}>
                    <input type="hidden" name="imageId" value={img.id} />
                    <ConfirmSubmit message="Bu fotoğraf silinsin mi?">Sil</ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/60">Henüz fotoğraf yok. Aşağıdan ekleyebilirsiniz.</p>
        )}
      </Panel>

      <ProductForm product={product} categories={categories} />

      <Panel title="Tehlikeli bölge" className="mt-10 ring-terracotta/30">
        <p className="mb-3 text-sm text-ink/70">Ürünü silmek geri alınamaz. Geçmiş siparişlerde ürün adı korunur. Satışı geçici durdurmak için “Sitede yayında” işaretini kaldırmanız yeterli.</p>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit message={`"${product.name}" kalıcı olarak silinsin mi?`}>Ürünü kalıcı olarak sil</ConfirmSubmit>
        </form>
      </Panel>
    </div>
  );
}

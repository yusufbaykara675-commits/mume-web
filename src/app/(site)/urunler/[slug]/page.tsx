import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { demoProducts, hasDatabase } from "@/lib/demo";
import { productCardInclude, type ProductCardData } from "@/lib/catalog";
import { stockInfo } from "@/lib/stock";
import { formatPrice } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { toParagraphs } from "@/lib/text";
import { whatsappLink } from "@/lib/whatsapp";
import { productJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCart } from "@/components/cart/AddToCart";
import { ProductCard } from "@/components/site/ProductCard";
import { JsonLd } from "@/components/site/JsonLd";
import { ProductInfo } from "@/components/site/InfoSections";
import { t } from "@/i18n";

type Params = Promise<{ slug: string }>;

async function getProduct(slug: string) {
  if (!hasDatabase) return demoProducts.find((p) => p.slug === slug) ?? null;
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Ürün bulunamadı" };
  const description = (p.shortDescription || p.description).slice(0, 160);
  return {
    title: p.name,
    description,
    alternates: { canonical: `/urunler/${p.slug}` },
    openGraph: {
      title: p.name,
      description,
      url: `${SITE_URL}/urunler/${p.slug}`,
      images: p.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt || p.name })),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [business, related] = await Promise.all([
    getSetting("business"),
    hasDatabase
      ? prisma.product.findMany({
          where: { isActive: true, id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
          include: productCardInclude,
          take: 4,
          orderBy: { isFeatured: "desc" },
        })
      : Promise.resolve<ProductCardData[]>(
          demoProducts
            .filter((p) => p.id !== product.id)
            .sort((a, b) => Number(b.categoryId === product.categoryId) - Number(a.categoryId === product.categoryId))
            .slice(0, 4),
        ),
  ]);
  const stock = stockInfo(product.stock);
  const productUrl = `${SITE_URL}/urunler/${product.slug}`;
  const ask = whatsappLink(business.whatsapp, `Merhaba MuMê, "${product.name}" hakkında bilgi almak istiyorum.\n${productUrl}`);
  const images = product.images.length ? product.images : [{ id: "ph", url: "/art/cicek-bahcesi.svg", alt: product.name, sortOrder: 0, productId: product.id }];

  return (
    <div className="container-page py-8 md:py-14">
      <nav aria-label="Sayfa konumu" className="mb-6 text-xs text-ink/60">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link href="/" className="hover:text-terracotta">Ana Sayfa</Link> /</li>
          <li><Link href="/urunler" className="hover:text-terracotta">Koleksiyon</Link> /</li>
          {product.category && (
            <li><Link href={`/urunler?kategori=${product.category.slug}`} className="hover:text-terracotta">{product.category.name}</Link> /</li>
          )}
          <li aria-current="page" className="text-espresso">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div data-reveal="zoom">
        <ProductGallery images={images.map((i) => ({ url: i.url, alt: i.alt || product.name }))} />
        </div>

        <div data-reveal="right" className="md:sticky md:top-28 md:self-start">
          {product.category && <p className="eyebrow mb-3">{product.category.name}</p>}
          <h1 className="text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-espresso">
            {product.compareAtCents && product.priceCents !== null && product.compareAtCents > product.priceCents && (
              <span className="mr-3 text-lg font-normal text-ink/45 line-through">{formatPrice(product.compareAtCents)}</span>
            )}
            {formatPrice(product.priceCents)}
          </p>
          <p
            className={`mt-2 inline-flex items-center gap-2 text-sm ${
              stock.tone === "out" ? "text-terracotta" : stock.tone === "low" ? "text-terracotta" : "text-sage"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {stock.label}
          </p>
          {product.shortDescription && <p className="mt-6 leading-relaxed text-ink/80">{product.shortDescription}</p>}

          <div className="mt-8">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: images[0]?.url ?? null,
                priceCents: product.priceCents,
                colors: product.colors,
                fragrances: product.fragrances,
              }}
              stock={stock}
            />
            {ask && (
              <a href={ask} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-3 w-full">
                {t.cta.orderWhatsapp}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink/60">{t.shop.customNote}</p>
            <ProductInfo />
          </div>

          <div className="prose-mume mt-10 border-t border-sand pt-8">
            <h2 className="mt-0! text-2xl">Ürün hakkında</h2>
            {toParagraphs(product.description).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl md:text-4xl">{t.shop.related}</h2>
          <div data-stagger="90" className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={productJsonLd({
          name: product.name,
          slug: product.slug,
          description: product.shortDescription || product.description,
          images: images.map((i) => i.url),
          priceCents: product.priceCents,
          stock: product.stock,
          category: product.category?.name,
        })}
      />
    </div>
  );
}

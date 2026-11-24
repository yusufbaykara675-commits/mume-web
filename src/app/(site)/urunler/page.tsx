import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, searchProducts, type SortKey } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { ShopToolbar } from "@/components/site/ShopToolbar";
import { t } from "@/i18n";

type SP = Promise<{ kategori?: string; q?: string; sirala?: string }>;

const SORTS: SortKey[] = ["yeni", "fiyat-artan", "fiyat-azalan", "isim"];

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { kategori } = await searchParams;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === kategori);
  return {
    title: cat ? cat.name : "Koleksiyon",
    description: cat?.description ?? "El yapımı çiçek tasarımlı, dekoratif, kişiye özel ve hediyelik mumlar — MuMê Mum Atölyesi koleksiyonu.",
    alternates: { canonical: cat ? `/urunler?kategori=${cat.slug}` : "/urunler" },
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sort = SORTS.includes(sp.sirala as SortKey) ? (sp.sirala as SortKey) : "yeni";
  const q = (sp.q ?? "").slice(0, 60).trim();
  const [categories, products] = await Promise.all([
    getCategories(),
    searchProducts({ category: sp.kategori, q: q || undefined, sort }),
  ]);
  const active = categories.find((c) => c.slug === sp.kategori);

  const catHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("kategori", slug);
    if (q) params.set("q", q);
    if (sort !== "yeni") params.set("sirala", sort);
    const s = params.toString();
    return `/urunler${s ? `?${s}` : ""}`;
  };

  return (
    <div className="container-page py-12 md:py-16">
      <header data-reveal="blur" className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">MuMê</p>
        <h1 className="text-5xl md:text-6xl">{active ? active.name : t.shop.title}</h1>
        <p className="mt-4 text-ink/75">{active?.description ?? t.shop.intro}</p>
      </header>

      <nav aria-label="Kategoriler" className="-mx-5 mb-6 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="flex gap-2">
          <li className="flex-none">
            <Link
              href={catHref()}
              className={`block rounded-full px-4 py-2 text-sm font-medium transition ${!active ? "bg-espresso text-ivory" : "border border-beige text-espresso hover:border-espresso"}`}
            >
              {t.shop.all}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id} className="flex-none">
              <Link
                href={catHref(c.slug)}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition ${active?.id === c.id ? "bg-espresso text-ivory" : "border border-beige text-espresso hover:border-espresso"}`}
                aria-current={active?.id === c.id ? "page" : undefined}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense fallback={<div className="h-[74px] border-y border-sand" />}>
        <ShopToolbar initialQuery={q} sort={sort} count={products.length} />
      </Suspense>

      {products.length ? (
        <div data-stagger="70" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-12 text-center">
          <p className="font-serif text-2xl">{t.shop.empty}</p>
          <Link href="/urunler" className="btn-outline mt-6">
            Filtreleri temizle
          </Link>
        </div>
      )}
    </div>
  );
}

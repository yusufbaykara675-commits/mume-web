import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { stockInfo } from "@/lib/stock";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const [first, second] = product.images;
  const stock = stockInfo(product.stock);
  return (
    <Link href={`/urunler/${product.slug}`} className="group block">
      <div className="glow-card relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand shadow-[var(--shadow-soft)] transition duration-500 group-hover:shadow-[var(--shadow-lift)]">
        {first && (
          <Image
            src={first.url}
            alt={first.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition duration-700 group-hover:scale-[1.04] ${second ? "group-hover:opacity-0" : ""}`}
            priority={priority}
          />
        )}
        {second && (
          <Image
            src={second.url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
          />
        )}
        {stock.tone !== "ok" && stock.tone !== "made" && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${
              stock.tone === "out" ? "bg-espresso/85 text-cream" : "bg-terracotta text-white"
            }`}
          >
            {stock.label}
          </span>
        )}
      </div>
      <div className="mt-4 px-1">
        {product.category && <p className="text-[11px] uppercase tracking-[0.18em] text-sage">{product.category.name}</p>}
        <h3 className="mt-1 font-serif text-xl leading-snug text-espresso transition group-hover:text-terracotta">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-ink">
          {product.compareAtCents && product.priceCents !== null && product.compareAtCents > product.priceCents && (
            <span className="mr-2 font-normal text-ink/45 line-through">{formatPrice(product.compareAtCents)}</span>
          )}
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}

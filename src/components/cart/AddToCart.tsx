"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { QuantityInput } from "./QuantityInput";
import type { StockInfo } from "@/lib/stock";
import { t } from "@/i18n";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
    priceCents: number | null;
    colors: string[];
    fragrances: string[];
  };
  stock: StockInfo;
};

function OptionGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-sm font-medium text-espresso">
        {label}: <span className="font-normal text-ink/70">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" className="peer sr-only" name={label} value={o} checked={value === o} onChange={() => onChange(o)} />
            <span className="block rounded-full border border-beige px-4 py-2 text-sm transition peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-ivory peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta hover:border-espresso">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AddToCart({ product, stock }: Props) {
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [fragrance, setFragrance] = useState(product.fragrances[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!stock.purchasable) {
    return (
      <button className="btn-primary w-full" disabled>
        Tükendi
      </button>
    );
  }

  return (
    <div>
      {product.colors.length > 0 && <OptionGroup label={t.shop.color} options={product.colors} value={color} onChange={setColor} />}
      {product.fragrances.length > 0 && (
        <OptionGroup label={t.shop.fragrance} options={product.fragrances} value={fragrance} onChange={setFragrance} />
      )}
      <div className="flex gap-3">
        <QuantityInput value={qty} max={stock.max} onChange={(v) => setQty(Math.max(1, Math.min(stock.max, v)))} />
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={() => {
            add({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              unitPriceCents: product.priceCents,
              color: color || null,
              fragrance: fragrance || null,
              quantity: qty,
              max: stock.max,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2200);
          }}
        >
          {added ? `✓ ${t.cta.added}` : t.cta.addToCart}
        </button>
      </div>
    </div>
  );
}

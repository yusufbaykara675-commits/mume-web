"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import { t } from "@/i18n";
import { QuantityInput } from "./QuantityInput";

export function CartDrawer() {
  const { lines, drawerOpen, setDrawerOpen, subtotalCents, hasUnpriced, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        className={`absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 className="text-2xl">{t.cart.title}</h2>
          <button onClick={() => setDrawerOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label={t.nav.close}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-ink/70">{t.cart.empty}</p>
            <Link href="/urunler" className="btn-primary" onClick={() => setDrawerOpen(false)}>
              {t.cta.explore}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 flex-none overflow-hidden rounded-xl bg-sand">
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link href={`/urunler/${l.slug}`} onClick={() => setDrawerOpen(false)} className="font-serif text-lg leading-tight text-espresso">
                      {l.name}
                    </Link>
                    <p className="text-xs text-ink/60">{[l.color, l.fragrance].filter(Boolean).join(" · ")}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityInput value={l.quantity} max={l.max} onChange={(q) => setQuantity(l.key, q)} small />
                      <span className="text-sm font-semibold">
                        {l.unitPriceCents === null ? "Fiyat sorulacak" : formatPrice(l.unitPriceCents * l.quantity)}
                      </span>
                    </div>
                    <button onClick={() => remove(l.key)} className="mt-1 self-start text-xs text-ink/50 underline-offset-2 hover:underline">
                      {t.cart.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-sand bg-cream/60 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold">{formatPrice(subtotalCents)}</span>
              </div>
              {hasUnpriced && <p className="text-xs text-ink/60">{t.cart.unpriced}</p>}
              <p className="text-xs text-ink/60">{t.cart.shippingNote}</p>
              <Link href="/sepet" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                {t.cart.checkout}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

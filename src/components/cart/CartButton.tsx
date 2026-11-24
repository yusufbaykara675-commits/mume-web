"use client";

import { useCart } from "./CartProvider";
import { t } from "@/i18n";

export function CartButton() {
  const { count, ready, setDrawerOpen } = useCart();
  return (
    <button
      onClick={() => setDrawerOpen(true)}
      className="relative rounded-full p-2.5 text-espresso transition hover:bg-sand"
      aria-label={`${t.nav.cart}${ready && count ? ` (${count} ürün)` : ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 016 0" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

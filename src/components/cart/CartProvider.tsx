"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPriceCents: number | null; // yalnızca gösterim içindir; sipariş tutarı sunucuda hesaplanır
  color: string | null;
  fragrance: string | null;
  quantity: number;
  max: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  hasUnpriced: boolean;
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mume-sepet-v1";

export function lineKey(productId: string, color: string | null, fragrance: string | null) {
  return [productId, color ?? "", fragrance ?? ""].join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sepeti tarayıcıda saklar (çerez değil, yalnızca bu cihazda localStorage)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* depolama erişilemiyorsa sepet bellekte çalışır */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* yoksay */
    }
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "key">) => {
    const key = lineKey(line.productId, line.color, line.fragrance);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.max, l.quantity + line.quantity) } : l));
      }
      return [...prev, { ...line, key, quantity: Math.min(line.max, line.quantity) }];
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(l.max, Math.floor(quantity) || 1)) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotalCents = lines.reduce((s, l) => s + (l.unitPriceCents ?? 0) * l.quantity, 0);
    const hasUnpriced = lines.some((l) => l.unitPriceCents === null);
    return { lines, ready, count, subtotalCents, hasUnpriced, add, setQuantity, remove, clear, drawerOpen, setDrawerOpen };
  }, [lines, ready, add, setQuantity, remove, clear, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalı");
  return ctx;
}

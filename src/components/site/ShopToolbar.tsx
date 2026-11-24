"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { t } from "@/i18n";

export function ShopToolbar({ initialQuery, sort, count }: { initialQuery: string; sort: string; count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  // Yazmayı bitirince arama yapar
  useEffect(() => {
    if (q === initialQuery) return;
    const id = setTimeout(() => update("q", q.trim()), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-3 border-y border-sand py-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-xs">
        <span className="sr-only">{t.shop.search}</span>
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.shop.search} className="input rounded-full! pl-10" />
      </label>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className={`text-sm text-ink/60 transition ${pending ? "opacity-50" : ""}`} aria-live="polite">
          {pending ? "Yükleniyor…" : t.shop.results(count)}
        </span>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink/60">{t.shop.sort}</span>
          <select value={sort} onChange={(e) => update("sirala", e.target.value === "yeni" ? "" : e.target.value)} className="rounded-full border border-beige bg-white px-4 py-2 text-sm">
            {Object.entries(t.shop.sortOptions).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

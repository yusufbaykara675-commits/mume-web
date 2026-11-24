"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/yonetim", label: "Genel Bakış", exact: true },
  { href: "/yonetim/siparisler", label: "Siparişler", badgeKey: "orders" },
  { href: "/yonetim/rezervasyonlar", label: "Rezervasyonlar", badgeKey: "reservations" },
  { href: "/yonetim/urunler", label: "Ürünler" },
  { href: "/yonetim/kategoriler", label: "Kategoriler" },
  { href: "/yonetim/workshoplar", label: "Workshoplar" },
  { href: "/yonetim/mesajlar", label: "Mesajlar", badgeKey: "messages" },
  { href: "/yonetim/icerik", label: "Site İçeriği" },
  { href: "/yonetim/yorumlar", label: "Müşteri Yorumları" },
  { href: "/yonetim/hesap", label: "Hesap" },
] as const;

export function AdminNav({ badges }: { badges: { orders: number; reservations: number; messages: number } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const list = (
    <ul className="space-y-1">
      {items.map((i) => {
        const active = "exact" in i && i.exact ? pathname === i.href : pathname.startsWith(i.href);
        const badge = "badgeKey" in i ? badges[i.badgeKey] : 0;
        return (
          <li key={i.href}>
            <Link
              href={i.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-cream text-espresso" : "text-cream/80 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              {i.label}
              {badge > 0 && <span className="rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
  return (
    <>
      <div className="flex items-center justify-between bg-espresso px-4 py-3 text-cream lg:hidden">
        <Link href="/yonetim" className="font-serif text-xl italic">MuMê Yönetim</Link>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-cream/20 px-3 py-1.5 text-sm" aria-expanded={open}>
          {open ? "Kapat" : "Menü"}
        </button>
      </div>
      {open && <nav className="bg-espresso px-4 pb-4 lg:hidden">{list}</nav>}
      <aside className="hidden w-64 flex-none flex-col bg-espresso px-4 py-6 text-cream lg:flex">
        <Link href="/yonetim" className="mb-8 px-3">
          <span className="block font-serif text-2xl italic">MuMê</span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-sage-soft">Yönetim Paneli</span>
        </Link>
        <nav className="flex-1">{list}</nav>
        <Link href="/" target="_blank" className="mt-6 px-3 text-xs text-cream/60 hover:text-flame">
          Siteyi görüntüle ↗
        </Link>
      </aside>
    </>
  );
}

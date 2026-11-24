"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "@/components/cart/CartButton";
import { t } from "@/i18n";

const links = [
  { href: "/urunler", label: t.nav.shop },
  { href: "/workshoplar", label: t.nav.workshops },
  { href: "/hakkimizda", label: t.nav.about },
  { href: "/iletisim", label: t.nav.contact },
];

export function Header({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {announcement && (
        <div className="bg-olive px-4 py-2 text-center text-xs font-medium tracking-wide text-cream">{announcement}</div>
      )}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-ivory/90 shadow-[0_1px_0_rgb(61_42_23/0.08)] backdrop-blur-md" : "bg-ivory"
        }`}
      >
        <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-ivory">
          İçeriğe geç
        </a>
        <div className="container-page flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label="MuMê Mum Atölyesi ana sayfa">
            <Image src="/brand/logo-small.jpg" alt="" width={40} height={52} className="h-12 w-auto rounded-md shadow-sm" priority />
            <span className="leading-none">
              <span className="block font-serif text-2xl font-semibold italic text-espresso">MuMê</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-sage">Mum Atölyesi</span>
            </span>
          </Link>

          <nav aria-label="Ana menü" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`relative text-sm font-medium transition hover:text-terracotta ${active ? "text-terracotta" : "text-espresso"}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/workshoplar" className="btn-accent hidden px-5! py-2.5! lg:inline-flex">
              {t.cta.joinWorkshop}
            </Link>
            <CartButton />
            <button
              className="rounded-full p-2.5 text-espresso hover:bg-sand md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobil-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        <div
          id="mobil-menu"
          className={`overflow-hidden border-t border-sand bg-ivory transition-[max-height] duration-300 md:hidden ${open ? "max-h-96" : "max-h-0 border-transparent"}`}
        >
          <nav aria-label="Mobil menü" className="container-page py-4">
            <ul className="space-y-1">
              {[{ href: "/", label: t.nav.home }, ...links].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-xl px-3 py-3 font-serif text-xl text-espresso hover:bg-sand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/workshoplar" className="btn-accent mt-3 w-full">
              {t.cta.joinWorkshop}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

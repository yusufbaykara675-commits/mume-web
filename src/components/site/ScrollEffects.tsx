"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sayfa genelinde kaydırma hareketleri:
 *  - [data-reveal]   → görünür alana girince yumuşakça belirir (up | left | right | zoom | fade)
 *  - [data-stagger]  → içindeki öğeler sırayla belirir
 *  - [data-parallax] → kaydırırken farklı hızda kayar (ör. data-parallax="0.12")
 *  - --scroll        → üst menüdeki ilerleme çubuğu için sayfa ilerlemesi (0–1)
 * "Hareketi azalt" tercihi açık olan ziyaretçilerde animasyon uygulanmaz.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const watched = new WeakSet<Element>();

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((parent) => {
        const step = Number(parent.dataset.stagger) || 90;
        Array.from(parent.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", parent.dataset.staggerType || "up");
          el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * step}ms`);
        });
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((t) => {
        if (watched.has(t)) return;
        watched.add(t);
        if (reduce) t.classList.add("is-in");
        else io.observe(t);
      });
    };
    scan();
    // Filtreleme/arama sonrası sonradan eklenen öğeler de izlenir
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = window.setTimeout(() => {
        pending = 0;
        scan();
      }, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const parallax = reduce ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
        const vh = window.innerHeight;
        for (const el of parallax) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > vh + 200) continue;
          const speed = Number(el.dataset.parallax) || 0.1;
          const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      mo.disconnect();
      if (pending) clearTimeout(pending);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}

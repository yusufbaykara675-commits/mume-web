"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand shadow-[var(--shadow-soft)]">
        {current && (
          <Image key={current.url} src={current.url} alt={current.alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="fade-up object-cover" />
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ivory/85 p-2.5 shadow md:hidden"
              aria-label="Önceki fotoğraf"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ivory/85 p-2.5 shadow md:hidden"
              aria-label="Sonraki fotoğraf"
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl ring-2 transition ${i === active ? "ring-terracotta" : "ring-transparent hover:ring-beige"}`}
                aria-label={`Fotoğraf ${i + 1}`}
                aria-current={i === active}
              >
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

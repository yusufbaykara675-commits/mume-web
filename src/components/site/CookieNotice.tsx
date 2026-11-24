"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "mume-cerez-bilgi-v1";

/**
 * Site yalnızca zorunlu teknik depolama kullanır (sepet ve yönetici oturumu).
 * Analitik/pazarlama çerezi eklenirse bu bileşen açık onay (kabul/ret) alacak şekilde genişletilmelidir.
 */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!window.localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-2xl bg-espresso p-4 text-sm text-cream shadow-2xl sm:inset-x-6 sm:bottom-6">
      <p className="leading-relaxed text-cream/85">
        Sitemizde yalnızca sepetinizin hatırlanması gibi zorunlu teknik depolama kullanılır; reklam veya takip çerezi kullanılmaz.{" "}
        <Link href="/cerez-politikasi" className="text-flame underline underline-offset-2">Ayrıntılar</Link>
      </p>
      <button
        className="mt-3 rounded-full bg-cream px-5 py-2 text-xs font-semibold text-espresso"
        onClick={() => {
          try {
            window.localStorage.setItem(KEY, "1");
          } catch {}
          setShow(false);
        }}
      >
        Anladım
      </button>
    </div>
  );
}

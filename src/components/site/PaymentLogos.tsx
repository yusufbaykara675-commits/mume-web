import Image from "next/image";

/**
 * iyzico'nun istediği "iyzico ile Öde", Visa ve Mastercard logoları.
 * Resmî logo bandı yönetim panelinden (İçerik > Yasal metinler ve ödeme) yüklenir.
 * Yüklenmemişse yalnızca yazı olarak gösterilir — logolar elle çizilmez,
 * marka kuralları gereği resmî dosyalar kullanılmalıdır.
 */
export function PaymentLogos({ src, tone = "dark" }: { src: string; tone?: "dark" | "light" }) {
  if (src) {
    return (
      <div className={`relative h-8 w-64 ${tone === "dark" ? "rounded-md bg-white/95 px-2" : ""}`}>
        <Image src={src} alt="iyzico ile Öde, Visa ve Mastercard" fill sizes="256px" className="object-contain" />
      </div>
    );
  }
  const pill = tone === "dark" ? "border-cream/25 text-cream/80" : "border-sand text-ink/70";
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Ödeme yöntemleri">
      {["iyzico ile Öde", "Visa", "Mastercard"].map((l) => (
        <li key={l} className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${pill}`}>
          {l}
        </li>
      ))}
    </ul>
  );
}

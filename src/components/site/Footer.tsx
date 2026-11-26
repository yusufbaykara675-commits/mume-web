import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { mapsLink } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { t } from "@/i18n";
import { LEGAL_PAGES, type LegalSlug } from "@/lib/legal";
import { PaymentLogos } from "./PaymentLogos";

export function Footer({ business, hours, legal }: { business: Settings["business"]; hours: Settings["hours"]; legal: Settings["legal"] }) {
  const wa = whatsappLink(business.whatsapp, "Merhaba MuMê, bilgi almak istiyorum.");
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-small.jpg" alt="MuMê Mum Atölyesi logosu" width={64} height={83} className="rounded-lg" />
            <div>
              <p className="font-serif text-3xl italic text-cream">MuMê</p>
              <p className="text-xs uppercase tracking-[0.3em] text-sage-soft">Mum Atölyesi</p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">{business.tagline}</p>
          <div className="mt-6 flex gap-3">
            <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cream/20 p-2.5 transition hover:border-flame hover:text-flame" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cream/20 p-2.5 transition hover:border-flame hover:text-flame" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 000-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>
              </a>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-flame">Keşfet</p>
          <ul className="space-y-2.5 text-sm text-cream/80">
            <li><Link href="/urunler" className="hover:text-flame">{t.nav.shop}</Link></li>
            <li><Link href="/workshoplar" className="hover:text-flame">{t.nav.workshops}</Link></li>
            <li><Link href="/hakkimizda" className="hover:text-flame">{t.nav.about}</Link></li>
            <li><Link href="/iletisim" className="hover:text-flame">{t.nav.contact}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-flame">Atölye</p>
          <address className="not-italic text-sm leading-relaxed text-cream/80">
            {business.addressLine}
            <br />
            {[business.district, business.city].filter(Boolean).join(" / ")}
          </address>
          <a href={mapsLink(business.mapsQuery)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-flame underline-offset-4 hover:underline">
            Yol tarifi al →
          </a>
          {business.phone && <p className="mt-3 text-sm text-cream/80">{business.phone}</p>}
          {business.email && <p className="text-sm text-cream/80">{business.email}</p>}
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-flame">Çalışma Saatleri</p>
          <ul className="space-y-1 text-sm text-cream/80">
            {hours.days.map((d) => (
              <li key={d.day} className="flex justify-between gap-4">
                <span>{d.day}</span>
                <span>{d.closed ? "Kapalı" : `${d.open} – ${d.close}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Yasal bilgiler" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-cream/70">
            {(Object.keys(LEGAL_PAGES) as LegalSlug[]).map((s) => (
              <Link key={s} href={`/${s}`} className="hover:text-flame">{LEGAL_PAGES[s].title}</Link>
            ))}
            <Link href="/kvkk" className="hover:text-flame">{t.footer.kvkk}</Link>
            <Link href="/cerez-politikasi" className="hover:text-flame">{t.footer.cookies}</Link>
          </nav>
          <PaymentLogos src={legal.paymentLogos} />
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.name}. {t.footer.rights}</p>
          {(legal.sellerTitle || legal.taxNumber) && (
            <p>
              {[legal.sellerTitle, [legal.taxOffice, legal.taxNumber].filter(Boolean).join(" V.D. / "), legal.mersisNumber && `MERSİS: ${legal.mersisNumber}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

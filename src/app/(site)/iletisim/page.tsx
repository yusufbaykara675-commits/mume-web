import type { Metadata } from "next";
import { getSettings, mapsEmbedUrl, mapsLink } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description: "MuMê Mum Atölyesi iletişim bilgileri, adres, çalışma saatleri ve WhatsApp hattı. Şerefiye Mahallesi, Van.",
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  const { business, hours } = await getSettings(["business", "hours"]);
  const wa = whatsappLink(business.whatsapp, "Merhaba MuMê, bilgi almak istiyorum.");
  return (
    <div className="container-page py-12 md:py-16">
      <header data-reveal="blur" className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Bize ulaşın</p>
        <h1 className="text-5xl md:text-6xl">İletişim</h1>
        <p className="mt-4 text-ink/75">Sipariş, kişiye özel tasarım, workshop ya da organizasyon talepleriniz için bize yazın.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div data-reveal="left" className="space-y-6 lg:col-span-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                WhatsApp&apos;tan Yazın
              </a>
            )}
            <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
              Instagram {business.instagramHandle}
            </a>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl">Adres</h2>
            <address className="mt-2 not-italic leading-relaxed text-ink/80">
              {business.addressLine}
              <br />
              {[business.district, business.city].filter(Boolean).join(" / ")}, {business.country}
            </address>
            <a href={mapsLink(business.mapsQuery)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-terracotta">
              Google Haritalar&apos;da aç →
            </a>
            {(business.phone || business.email) && (
              <div className="mt-4 space-y-1 text-sm">
                {business.phone && (
                  <p>
                    Telefon: <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="font-semibold">{business.phone}</a>
                  </p>
                )}
                {business.email && (
                  <p>
                    E-posta: <a href={`mailto:${business.email}`} className="font-semibold">{business.email}</a>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-2xl">Çalışma saatleri</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {hours.days.map((d) => (
                <li key={d.day} className="flex justify-between">
                  <span className="text-ink/70">{d.day}</span>
                  <span className="font-medium">{d.closed ? "Kapalı" : `${d.open} – ${d.close}`}</span>
                </li>
              ))}
            </ul>
            {hours.note && <p className="mt-3 text-xs text-ink/55">{hours.note}</p>}
          </div>
        </div>

        <div data-reveal="right" className="space-y-8 lg:col-span-7">
          <div className="card p-6 md:p-8">
            <h2 className="text-3xl">Mesaj gönderin</h2>
            <ContactForm />
          </div>
          <iframe
            title="MuMê Mum Atölyesi harita konumu"
            src={mapsEmbedUrl(business.mapsQuery)}
            className="h-80 w-full rounded-[var(--radius-card)] border-0 shadow-[var(--shadow-soft)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

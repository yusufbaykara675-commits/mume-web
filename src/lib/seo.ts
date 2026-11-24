import { SITE_URL } from "./site";
import type { Settings } from "./settings";

const abs = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`);

export function localBusinessJsonLd(business: Settings["business"], hours: Settings["hours"]) {
  const dayMap: Record<string, string> = {
    Pazartesi: "Monday",
    Salı: "Tuesday",
    Çarşamba: "Wednesday",
    Perşembe: "Thursday",
    Cuma: "Friday",
    Cumartesi: "Saturday",
    Pazar: "Sunday",
  };
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#isletme`,
    name: business.name,
    description: business.tagline,
    url: SITE_URL,
    image: abs("/brand/og.jpg"),
    logo: abs("/brand/logo.jpg"),
    telephone: business.phone || undefined,
    email: business.email || undefined,
    sameAs: [business.instagramUrl].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.addressLine,
      addressLocality: business.district || business.city,
      addressRegion: business.city,
      postalCode: business.postalCode || undefined,
      addressCountry: "TR",
    },
    geo:
      business.latitude && business.longitude
        ? { "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude }
        : undefined,
    openingHoursSpecification: hours.days
      .filter((d) => !d.closed && d.open && d.close && dayMap[d.day])
      .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayMap[d.day], opens: d.open, closes: d.close })),
  };
}

export function productJsonLd(p: {
  name: string;
  slug: string;
  description: string;
  images: string[];
  priceCents: number | null;
  stock: number | null;
  category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description.slice(0, 500),
    image: p.images.map(abs),
    url: `${SITE_URL}/urunler/${p.slug}`,
    category: p.category ?? undefined,
    brand: { "@type": "Brand", name: "MuMê" },
    // Fiyat girilmemiş ürünlerde teklif bilgisi yayınlanmaz (yanıltıcı veri üretmemek için).
    offers:
      p.priceCents === null
        ? undefined
        : {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: (p.priceCents / 100).toFixed(2),
            availability:
              p.stock === 0 ? "https://schema.org/OutOfStock" : p.stock === null ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
            url: `${SITE_URL}/urunler/${p.slug}`,
            seller: { "@id": `${SITE_URL}/#isletme` },
          },
  };
}

export function workshopEventsJsonLd(w: {
  title: string;
  slug: string;
  description: string;
  image?: string | null;
  durationMinutes: number;
  priceCents: number | null;
  sessions: { startsAt: Date; seatsLeft: number }[];
  business: Settings["business"];
}) {
  return w.sessions.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: w.title,
    description: w.description.slice(0, 500),
    startDate: s.startsAt.toISOString(),
    endDate: new Date(s.startsAt.getTime() + w.durationMinutes * 60000).toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: w.image ? [abs(w.image)] : undefined,
    location: {
      "@type": "Place",
      name: w.business.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: w.business.addressLine,
        addressLocality: w.business.city,
        addressCountry: "TR",
      },
    },
    organizer: { "@type": "Organization", name: w.business.name, url: SITE_URL },
    offers:
      w.priceCents === null
        ? undefined
        : {
            "@type": "Offer",
            price: (w.priceCents / 100).toFixed(2),
            priceCurrency: "TRY",
            availability: s.seatsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            url: `${SITE_URL}/workshoplar/${w.slug}`,
          },
  }));
}

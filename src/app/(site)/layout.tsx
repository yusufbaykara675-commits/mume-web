import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CookieNotice } from "@/components/site/CookieNotice";
import { JsonLd } from "@/components/site/JsonLd";
import { ScrollEffects } from "@/components/site/ScrollEffects";
import { getSettings } from "@/lib/settings";
import { localBusinessJsonLd } from "@/lib/seo";

// İçerik yönetim panelinden değiştiği için sayfalar her istekte güncel veriyle üretilir.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { business, hours, home } = await getSettings(["business", "hours", "home"]);
  return (
    <CartProvider>
      <ScrollEffects />
      <Header announcement={home.announcement} />
      <main id="icerik">{children}</main>
      <Footer business={business} hours={hours} />
      <CartDrawer />
      <CookieNotice />
      <JsonLd data={localBusinessJsonLd(business, hours)} />
    </CartProvider>
  );
}

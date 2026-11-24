import type { Metadata } from "next";
import { CheckoutView } from "@/components/forms/CheckoutView";
import { getSetting } from "@/lib/settings";
import { hasDatabase } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const business = await getSetting("business");
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="mb-10 text-5xl">Sepetiniz</h1>
      <CheckoutView hasWhatsapp={Boolean(business.whatsapp)} previewMode={!hasDatabase} instagramUrl={business.instagramUrl} />
    </div>
  );
}

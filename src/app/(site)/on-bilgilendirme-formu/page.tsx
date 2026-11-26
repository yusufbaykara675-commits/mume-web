import { LegalPageView, legalPageMetadata } from "@/components/site/LegalPage";

export const metadata = legalPageMetadata("on-bilgilendirme-formu");

export default function Page() {
  return <LegalPageView slug="on-bilgilendirme-formu" />;
}

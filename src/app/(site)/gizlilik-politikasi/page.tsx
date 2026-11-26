import { LegalPageView, legalPageMetadata } from "@/components/site/LegalPage";

export const metadata = legalPageMetadata("gizlilik-politikasi");

export default function Page() {
  return <LegalPageView slug="gizlilik-politikasi" />;
}

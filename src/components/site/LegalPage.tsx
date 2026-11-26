import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { LEGAL_PAGES, legalText, type LegalSlug } from "@/lib/legal";
import { LegalDocument } from "./LegalDocument";

export function legalPageMetadata(slug: LegalSlug): Metadata {
  return { title: LEGAL_PAGES[slug].title, alternates: { canonical: `/${slug}` } };
}

export async function LegalPageView({ slug }: { slug: LegalSlug }) {
  const { business, legal } = await getSettings(["business", "legal"]);
  const page = LEGAL_PAGES[slug];
  const others = (Object.keys(LEGAL_PAGES) as LegalSlug[]).filter((s) => s !== slug);
  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl">{page.title}</h1>
      <p className="mt-2 text-xs text-ink/50">Sürüm: {legal.version}</p>
      <div className="mt-8">
        <LegalDocument text={legalText(page.key, business, legal)} />
      </div>
      <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand pt-6 text-sm">
        {others.map((s) => (
          <Link key={s} href={`/${s}`} className="text-terracotta underline-offset-4 hover:underline">
            {LEGAL_PAGES[s].title}
          </Link>
        ))}
        <Link href="/kvkk" className="text-terracotta underline-offset-4 hover:underline">KVKK Aydınlatma Metni</Link>
      </nav>
    </article>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { toParagraphs } from "@/lib/text";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "MuMê Mum Atölyesi'nin hikâyesi: Van'da el yapımı, tasarım odaklı mumlar ve mum yapım workshopları.",
  alternates: { canonical: "/hakkimizda" },
};

export default async function AboutPage() {
  const { about } = await getSettings(["about"]);
  return (
    <>
      <section className="container-page grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
        <div data-reveal="left">
          <p className="eyebrow mb-4">MuMê</p>
          <h1 className="text-5xl leading-[1.02] md:text-7xl">{about.title}</h1>
          <p className="mt-6 font-serif text-2xl italic leading-snug text-brown md:text-3xl">{about.intro}</p>
        </div>
        <div data-reveal="zoom" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
          <Image src={about.image} alt="MuMê atölyesinden bir kare" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-cream/70 py-16 md:py-24">
        <div className="container-page grid gap-12 md:grid-cols-12">
          <div data-reveal="up" className="prose-mume text-lg md:col-span-7">
            {toParagraphs(about.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <ul data-stagger="120" data-stagger-type="right" className="space-y-4 md:col-span-5">
            {about.values.map((v) => (
              <li key={v.title} className="rounded-2xl bg-ivory p-6 shadow-[var(--shadow-soft)]">
                <p className="font-serif text-2xl text-espresso">{v.title}</p>
                <p className="mt-1 text-sm text-ink/75">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-reveal="up" className="container-page py-16 text-center md:py-24">
        <h2 className="text-4xl md:text-5xl">Atölyemizde tanışalım</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/75">Koleksiyonu keşfedin ya da bir workshop&apos;a katılıp kendi mumunuzu tasarlayın.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/urunler" className="btn-primary">Koleksiyonu Keşfet</Link>
          <Link href="/workshoplar" className="btn-outline">Workshop&apos;a Katıl</Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { getUpcomingWorkshops } from "@/lib/catalog";
import { WorkshopCard } from "@/components/site/WorkshopCard";

export const metadata: Metadata = {
  title: "Mum Yapım Workshopları",
  description: "Van'da çiçekli ve dekoratif mum yapım workshopları. Tarih seçin, kişi sayısını belirleyin, yerinizi ayırtın.",
  alternates: { canonical: "/workshoplar" },
};

export default async function WorkshopsPage() {
  const workshops = await getUpcomingWorkshops();
  return (
    <div className="container-page py-12 md:py-16">
      <header data-reveal="blur" className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Atölyede birlikte üretelim</p>
        <h1 className="text-5xl md:text-6xl">Mum Yapım Workshopları</h1>
        <p className="mt-4 leading-relaxed text-ink/75">
          Arkadaşlarınızla, ailenizle ya da tek başınıza gelin; mum dökmenin, renk ve çiçeklerle tasarlamanın keyfini atölyemizde yaşayın.
          Tarih seçip rezervasyon talebinizi bırakın, onayınızı WhatsApp üzerinden iletelim.
        </p>
      </header>

      <ol data-stagger="120" className="mb-14 grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Tarih seçin", "Uygun workshop tarihini ve kişi sayısını belirleyin."],
          ["2", "Talep bırakın", "Bilgilerinizi gönderin, yeriniz sizin için ayrılsın."],
          ["3", "Onay alın", "Rezervasyonunuzu onaylayıp detayları size iletiyoruz."],
        ].map(([n, title, text]) => (
          <li key={n} className="rounded-2xl border border-sand bg-cream/50 p-5">
            <span className="font-serif text-3xl italic text-terracotta">{n}</span>
            <p className="mt-1 font-semibold">{title}</p>
            <p className="text-sm text-ink/70">{text}</p>
          </li>
        ))}
      </ol>

      {workshops.length ? (
        <div className="space-y-10">
          {workshops.map((w) => (
            <div key={w.id} data-reveal="up">
              <WorkshopCard workshop={w} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="font-serif text-2xl">Yeni workshop tarihleri çok yakında açıklanacak.</p>
          <p className="mt-2 text-ink/70">Grup ve özel organizasyon talepleriniz için bize yazabilirsiniz.</p>
        </div>
      )}
    </div>
  );
}

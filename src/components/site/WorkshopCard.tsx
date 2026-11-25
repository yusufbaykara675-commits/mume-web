import Image from "next/image";
import Link from "next/link";
import type { WorkshopWithSeats } from "@/lib/catalog";
import { formatDateTime, formatDuration, formatPrice } from "@/lib/format";

export function WorkshopCard({ workshop }: { workshop: WorkshopWithSeats }) {
  const next = workshop.sessions.find((s) => s.seatsLeft > 0) ?? workshop.sessions[0];
  return (
    <article className="card group grid overflow-hidden md:grid-cols-2">
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px]">
        <Image
          src={workshop.coverImageUrl || "/photos/tarot-gunes.webp"}
          alt={workshop.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-5 p-7 md:p-10">
        <p className="eyebrow">Workshop</p>
        <h3 className="text-3xl leading-tight md:text-4xl">{workshop.title}</h3>
        {workshop.shortDescription && <p className="text-ink/75">{workshop.shortDescription}</p>}
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink/55">Süre</dt>
            <dd className="font-semibold">{formatDuration(workshop.durationMinutes)}</dd>
          </div>
          <div>
            <dt className="text-ink/55">Kişi başı</dt>
            <dd className="font-semibold">{formatPrice(workshop.priceCents, "Ücret için yazın")}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-ink/55">Sıradaki tarih</dt>
            <dd className="font-semibold">
              {next ? (
                <>
                  {formatDateTime(next.startsAt)}{" "}
                  <span className={next.seatsLeft > 0 ? "text-sage" : "text-terracotta"}>
                    · {next.seatsLeft > 0 ? `${next.seatsLeft} kişilik yer var` : "Dolu"}
                  </span>
                </>
              ) : (
                "Yeni tarihler yakında"
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-auto pt-2">
          <Link href={`/workshoplar/${workshop.slug}`} className="btn-primary">
            {next ? "Tarih Seç ve Yer Ayırt" : "Detayları Gör"}
          </Link>
        </div>
      </div>
    </article>
  );
}

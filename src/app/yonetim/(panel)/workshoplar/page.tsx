import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatShortDateTime } from "@/lib/format";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Workshoplar" };

export default async function AdminWorkshopsPage({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const { silindi } = await searchParams;
  const workshops = await prisma.workshop.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { sessions: { where: { startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" } } },
  });
  return (
    <div>
      <PageHeader title="Workshoplar" text="Workshop içerikleri, tarihleri ve kapasiteleri" action={{ href: "/yonetim/workshoplar/yeni", label: "+ Yeni workshop" }} />
      {silindi && <Notice>Workshop silindi.</Notice>}
      {workshops.length ? (
        <ul className="space-y-3">
          {workshops.map((w) => {
            const active = w.sessions.filter((s) => s.isActive);
            return (
              <li key={w.id}>
                <Link href={`/yonetim/workshoplar/${w.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5 hover:ring-terracotta/40">
                  <div>
                    <p className="font-semibold text-espresso">{w.title}</p>
                    <p className="text-xs text-ink/55">
                      {formatPrice(w.priceCents, "Ücret girilmedi")} · {active.length} yayında tarih
                      {active[0] && ` · sıradaki: ${formatShortDateTime(active[0].startsAt)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!w.isActive && <Badge>Gizli</Badge>}
                    {w.isSample && <Badge tone="amber">Örnek</Badge>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>Henüz workshop yok.</Empty>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatShortDateTime } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { setMessageFlags } from "@/actions/admin/operations";
import { ConfirmSubmit } from "@/components/admin/AdminForm";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Mesajlar" };

function FlagButton({ id, action, label }: { id: string; action: string; label: string }) {
  return (
    <form action={setMessageFlags}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <button className="rounded-full bg-sand px-3 py-1 text-xs font-medium hover:bg-beige">{label}</button>
    </form>
  );
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ arsiv?: string }> }) {
  const { arsiv } = await searchParams;
  const archived = arsiv === "1";
  const messages = await prisma.contactMessage.findMany({ where: { isArchived: archived }, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <PageHeader title="Mesajlar" text="İletişim formundan gelen mesajlar" />
      <div className="mb-5 flex gap-2">
        <Link href="/yonetim/mesajlar" className={`rounded-full px-4 py-1.5 text-sm ${!archived ? "bg-espresso text-ivory" : "bg-white"}`}>Gelen kutusu</Link>
        <Link href="/yonetim/mesajlar?arsiv=1" className={`rounded-full px-4 py-1.5 text-sm ${archived ? "bg-espresso text-ivory" : "bg-white"}`}>Arşiv</Link>
      </div>
      {messages.length ? (
        <ul className="space-y-3">
          {messages.map((m) => {
            const wa = m.phone ? whatsappLink(m.phone, `Merhaba ${m.name.split(" ")[0]}, MuMê'den yazıyoruz. Mesajınız için teşekkürler.`) : null;
            return (
              <li key={m.id} className={`rounded-2xl p-5 shadow-sm ring-1 ring-espresso/5 ${m.isRead ? "bg-white" : "bg-ivory ring-terracotta/30"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-espresso">
                      {m.name} {!m.isRead && <Badge tone="amber">Yeni</Badge>}
                    </p>
                    <p className="text-xs text-ink/55">
                      {formatShortDateTime(m.createdAt)}
                      {m.phone && ` · ${m.phone}`}
                      {m.email && ` · ${m.email}`}
                    </p>
                  </div>
                  {m.subject && <span className="text-sm font-medium text-ink/70">{m.subject}</span>}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#1f7a4d] px-3 py-1 text-xs font-medium text-white">WhatsApp</a>}
                  {m.email && <a href={`mailto:${m.email}`} className="rounded-full bg-sand px-3 py-1 text-xs font-medium">E-posta</a>}
                  <FlagButton id={m.id} action={m.isRead ? "okunmadi" : "okundu"} label={m.isRead ? "Okunmadı yap" : "Okundu yap"} />
                  <FlagButton id={m.id} action={archived ? "geri" : "arsivle"} label={archived ? "Gelen kutusuna taşı" : "Arşivle"} />
                  <form action={setMessageFlags} className="ml-auto">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="action" value="sil" />
                    <ConfirmSubmit message="Mesaj kalıcı olarak silinsin mi?" className="text-xs">Sil</ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>{archived ? "Arşivde mesaj yok." : "Yeni mesaj yok."}</Empty>
      )}
    </div>
  );
}

import { prisma } from "@/lib/db";
import { deleteTestimonial, saveTestimonial } from "@/actions/admin/content";
import { AdminForm, ConfirmSubmit, SubmitButton } from "@/components/admin/AdminForm";
import { Checkbox, Input, Notice, PageHeader, Panel, Textarea } from "@/components/admin/ui";

export const metadata = { title: "Müşteri Yorumları" };

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div>
      <PageHeader title="Müşteri Yorumları" text="Yalnızca gerçek müşterilerinizden aldığınız, paylaşma izni olan yorumları ekleyin." />
      <Notice tone="amber">Yayında yorum olmadığı sürece ana sayfadaki yorum bölümü gizli kalır. Uydurma yorum yayınlamak tüketici mevzuatına aykırıdır.</Notice>

      <Panel title="Yeni yorum" className="mb-8">
        <AdminForm action={saveTestimonial} resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Yorum sahibi *" name="authorName" placeholder="Ayşe K." required />
            <Input label="Kaynak" name="source" placeholder="Instagram yorumu, Google yorumu…" />
          </div>
          <Textarea label="Yorum *" name="text" rows={3} required />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Checkbox name="isPublished" label="Sitede yayınla" />
            <SubmitButton>Ekle</SubmitButton>
          </div>
        </AdminForm>
      </Panel>

      <div className="space-y-4">
        {items.map((t) => (
          <Panel key={t.id}>
            <AdminForm action={saveTestimonial}>
              <input type="hidden" name="id" value={t.id} />
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_100px]">
                <Input label="Yorum sahibi" name="authorName" defaultValue={t.authorName} />
                <Input label="Kaynak" name="source" defaultValue={t.source ?? ""} />
                <Input label="Sıra" name="sortOrder" type="number" min={0} defaultValue={t.sortOrder} />
              </div>
              <Textarea label="Yorum" name="text" rows={3} defaultValue={t.text} />
              <div className="flex items-center justify-between">
                <Checkbox name="isPublished" label="Yayında" defaultChecked={t.isPublished} />
                <SubmitButton variant="outline">Kaydet</SubmitButton>
              </div>
            </AdminForm>
            <form action={deleteTestimonial} className="mt-3 border-t border-sand pt-3">
              <input type="hidden" name="id" value={t.id} />
              <ConfirmSubmit message="Yorum silinsin mi?">Sil</ConfirmSubmit>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { deleteCategory, saveCategory } from "@/actions/admin/products";
import { AdminForm, ConfirmSubmit, SubmitButton } from "@/components/admin/AdminForm";
import { Checkbox, Input, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <PageHeader title="Kategoriler" text="Mağazadaki ürün grupları. Sıra numarası küçük olan önce görünür." />

      <Panel title="Yeni kategori" className="mb-8">
        <AdminForm action={saveCategory} resetOnSuccess className="grid gap-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
          <Input label="Ad *" name="name" required />
          <Input label="Açıklama" name="description" />
          <Input label="Sıra" name="sortOrder" type="number" min={0} defaultValue={categories.length} />
          <input type="hidden" name="isActive" value="on" />
          <SubmitButton>Ekle</SubmitButton>
        </AdminForm>
      </Panel>

      <div className="space-y-4">
        {categories.map((c) => (
          <Panel key={c.id}>
            <AdminForm action={saveCategory} className="space-y-4">
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_100px]">
                <Input label="Ad" name="name" defaultValue={c.name} required />
                <Input label="Adres (slug)" name="slug" defaultValue={c.slug} />
                <Input label="Sıra" name="sortOrder" type="number" min={0} defaultValue={c.sortOrder} />
              </div>
              <Input label="Açıklama" name="description" defaultValue={c.description ?? ""} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Checkbox name="isActive" label="Sitede görünsün" defaultChecked={c.isActive} />
                <span className="text-xs text-ink/55">{c._count.products} ürün</span>
                <SubmitButton variant="outline">Kaydet</SubmitButton>
              </div>
            </AdminForm>
            <form action={deleteCategory} className="mt-3 border-t border-sand pt-3">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit message={`"${c.name}" silinsin mi? Bu kategorideki ürünler kategorisiz kalır.`}>Kategoriyi sil</ConfirmSubmit>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}

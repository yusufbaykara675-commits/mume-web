import type { Category, Product } from "@prisma/client";
import { saveProduct } from "@/actions/admin/products";
import { centsToInput } from "@/lib/format";
import { AdminForm, SubmitButton } from "./AdminForm";
import { Checkbox, Input, Panel, Textarea } from "./ui";

export function ProductForm({ product, categories }: { product?: Product | null; categories: Category[] }) {
  return (
    <AdminForm action={saveProduct} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Panel title="Temel bilgiler">
        <div className="space-y-5">
          <Input label="Ürün adı *" name="name" defaultValue={product?.name} required maxLength={120} />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label">Kategori</span>
              <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="input">
                <option value="">Kategorisiz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Adres (slug)" name="slug" defaultValue={product?.slug} hint="Boş bırakırsanız addan otomatik oluşturulur. Örn: cicekli-sutun-mum" />
          </div>
          <Input label="Kısa açıklama" name="shortDescription" defaultValue={product?.shortDescription ?? ""} maxLength={300} hint="Ürün sayfasında fiyatın altında görünür." />
          <Textarea
            label="Detaylı açıklama"
            name="description"
            rows={7}
            defaultValue={product?.description}
            hint="Ölçüler, yanma süresi, malzeme, kullanım ve güvenlik önerileri… Paragraflar arasında bir satır boşluk bırakın."
          />
        </div>
      </Panel>

      <Panel title="Fiyat ve stok">
        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Fiyat (₺)" name="price" inputMode="decimal" defaultValue={centsToInput(product?.priceCents)} placeholder="Örn: 450" hint="Boş bırakılırsa “Fiyat için yazın” görünür." />
          <Input label="İndirim öncesi fiyat (₺)" name="compareAt" inputMode="decimal" defaultValue={centsToInput(product?.compareAtCents)} hint="İsteğe bağlı, üstü çizili gösterilir." />
          <Input label="Stok adedi" name="stock" type="number" min={0} defaultValue={product?.stock ?? ""} hint="Boş = siparişe özel üretim. 0 = tükendi." />
        </div>
      </Panel>

      <Panel title="Seçenekler">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Renk seçenekleri" name="colors" defaultValue={product?.colors.join(", ")} hint="Virgülle ayırın: Krem, Adaçayı yeşili, Pudra" />
          <Input label="Koku seçenekleri" name="fragrances" defaultValue={product?.fragrances.join(", ")} hint="Virgülle ayırın: Kokusuz, Lavanta, Vanilya" />
        </div>
      </Panel>

      <Panel title="Fotoğraflar">
        <label className="block">
          <span className="label">Fotoğraf ekle</span>
          <input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" multiple className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ivory" />
          <span className="mt-1 block text-xs text-ink/55">Birden fazla seçebilirsiniz (en fazla 10, her biri 8 MB&apos;a kadar). Fotoğraflar otomatik küçültülüp optimize edilir. Dikey (4:5) fotoğraflar en iyi görünür.</span>
        </label>
      </Panel>

      <Panel title="Yayın">
        <div className="space-y-4">
          <Checkbox name="isActive" label="Sitede yayında" defaultChecked={product?.isActive ?? true} />
          <Checkbox name="isFeatured" label="Ana sayfada öne çıkar" defaultChecked={product?.isFeatured ?? false} />
        </div>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-sand bg-[#f4efe6]/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl">
        <SubmitButton>{product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

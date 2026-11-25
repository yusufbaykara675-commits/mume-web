import type { Workshop } from "@prisma/client";
import { saveWorkshop } from "@/actions/admin/workshops";
import { centsToInput } from "@/lib/format";
import { AdminForm, SubmitButton } from "./AdminForm";
import { Checkbox, Input, Panel, Textarea } from "./ui";
import { ImageInput } from "./ImageInput";

const fileClass =
  "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ivory";

export function WorkshopForm({ workshop }: { workshop?: Workshop | null }) {
  return (
    <AdminForm action={saveWorkshop} className="space-y-6">
      {workshop && <input type="hidden" name="id" value={workshop.id} />}
      <Panel title="Workshop bilgileri">
        <div className="space-y-5">
          <Input label="Workshop adı *" name="title" defaultValue={workshop?.title} required />
          <Input label="Adres (slug)" name="slug" defaultValue={workshop?.slug} hint="Boş bırakılırsa otomatik oluşturulur." />
          <Input label="Kısa açıklama" name="shortDescription" defaultValue={workshop?.shortDescription ?? ""} maxLength={300} />
          <Textarea label="Detaylı açıklama" name="description" rows={7} defaultValue={workshop?.description} hint="Neler yapılacak, kimler için uygun, yanınızda ne getirmeli… Paragraflar arasında boş satır bırakın." />
          <Textarea label="Neler dahil? (her satıra bir madde)" name="includes" rows={4} defaultValue={workshop?.includes.join("\n")} />
        </div>
      </Panel>
      <Panel title="Süre ve ücret">
        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Süre (dakika) *" name="durationMinutes" type="number" min={15} max={720} defaultValue={workshop?.durationMinutes ?? 120} required />
          <Input label="Kişi başı ücret (₺)" name="price" inputMode="decimal" defaultValue={centsToInput(workshop?.priceCents)} hint="Boş = “Ücret için yazın”" />
          <Input label="Sıra" name="sortOrder" type="number" min={0} defaultValue={workshop?.sortOrder ?? 0} />
        </div>
      </Panel>
      <Panel title="Fotoğraflar">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="label">Kapak fotoğrafı {workshop?.coverImageUrl ? "(değiştirmek için seçin)" : ""}</span>
            <ImageInput name="cover" className={fileClass} />
          </label>
          <label className="block">
            <span className="label">Galeriye fotoğraf ekle</span>
            <ImageInput name="gallery" multiple className={fileClass} />
          </label>
        </div>
      </Panel>
      <Panel title="Yayın">
        <Checkbox name="isActive" label="Sitede yayında" defaultChecked={workshop?.isActive ?? true} />
      </Panel>
      <div className="flex justify-end">
        <SubmitButton>{workshop ? "Kaydet" : "Workshop'u oluştur"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

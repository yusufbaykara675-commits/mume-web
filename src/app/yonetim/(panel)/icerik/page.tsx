import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { addInstagramPost, removeInstagramPost, saveAbout, saveBusiness, saveHome, saveHours } from "@/actions/admin/content";
import { AdminForm, ConfirmSubmit, SubmitButton } from "@/components/admin/AdminForm";
import { Input, PageHeader, Panel, Textarea } from "@/components/admin/ui";

export const metadata = { title: "Site İçeriği" };

const fileClass =
  "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ivory";

const sections = [
  ["isletme", "İşletme bilgileri"],
  ["saatler", "Çalışma saatleri"],
  ["anasayfa", "Ana sayfa & banner"],
  ["hakkimizda", "Hakkımızda"],
  ["instagram", "Instagram galerisi"],
] as const;

export default async function ContentPage() {
  const { business, hours, home, about, instagram, seo } = await getSettings(["business", "hours", "home", "about", "instagram", "seo"]);
  return (
    <div>
      <PageHeader title="Site İçeriği" text="Sitedeki metinler, iletişim bilgileri, çalışma saatleri ve görseller" />
      <nav className="mb-8 flex flex-wrap gap-2">
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-white px-4 py-1.5 text-sm hover:bg-cream">{label}</a>
        ))}
      </nav>

      <div className="space-y-10">
        <section id="isletme" className="scroll-mt-6">
          <Panel title="İşletme ve iletişim bilgileri">
            <AdminForm action={saveBusiness}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="İşletme adı" name="name" defaultValue={business.name} />
                <Input label="Kısa tanım" name="tagline" defaultValue={business.tagline} />
                <Input label="WhatsApp numarası" name="whatsapp" defaultValue={business.whatsapp} placeholder="0532 123 45 67" hint="Siparişler ve rezervasyonlar bu numaraya yönlendirilir." />
                <Input label="Telefon (sitede görünür)" name="phone" defaultValue={business.phone} />
                <Input label="E-posta" name="email" type="email" defaultValue={business.email} />
                <Input label="Instagram kullanıcı adı" name="instagramHandle" defaultValue={business.instagramHandle} />
                <Input label="Instagram adresi" name="instagramUrl" defaultValue={business.instagramUrl} className="sm:col-span-2" />
                <Input label="Adres" name="addressLine" defaultValue={business.addressLine} className="sm:col-span-2" />
                <Input label="İlçe" name="district" defaultValue={business.district} />
                <Input label="Şehir" name="city" defaultValue={business.city} />
                <Input label="Ülke" name="country" defaultValue={business.country} />
                <Input label="Posta kodu" name="postalCode" defaultValue={business.postalCode} />
                <Input label="Harita arama metni" name="mapsQuery" defaultValue={business.mapsQuery} className="sm:col-span-2" hint="Google Haritalar'da atölyenizi doğru gösteren adres veya işletme adı." />
                <Input label="Enlem (isteğe bağlı)" name="latitude" defaultValue={business.latitude} placeholder="38.50…" />
                <Input label="Boylam (isteğe bağlı)" name="longitude" defaultValue={business.longitude} placeholder="43.37…" />
              </div>
              <SubmitButton>Kaydet</SubmitButton>
            </AdminForm>
          </Panel>
        </section>

        <section id="saatler" className="scroll-mt-6">
          <Panel title="Çalışma saatleri">
            <AdminForm action={saveHours}>
              <div className="space-y-3">
                {hours.days.map((d, i) => (
                  <div key={d.day} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-3">
                    <span className="text-sm font-medium">{d.day}</span>
                    <input name={`open_${i}`} type="time" defaultValue={d.open} className="input py-2!" aria-label={`${d.day} açılış`} />
                    <input name={`close_${i}`} type="time" defaultValue={d.close} className="input py-2!" aria-label={`${d.day} kapanış`} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name={`closed_${i}`} defaultChecked={d.closed} className="accent-terracotta" /> Kapalı
                    </label>
                  </div>
                ))}
              </div>
              <Input label="Not" name="note" defaultValue={hours.note} />
              <SubmitButton>Kaydet</SubmitButton>
            </AdminForm>
          </Panel>
        </section>

        <section id="anasayfa" className="scroll-mt-6">
          <Panel title="Ana sayfa">
            <AdminForm action={saveHome}>
              <Input label="Duyuru şeridi (en üstte)" name="announcement" defaultValue={home.announcement} hint="Boş bırakılırsa gösterilmez. Örn: Öğretmenler Günü siparişleri için son gün 20 Kasım" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Banner üst yazı" name="heroEyebrow" defaultValue={home.heroEyebrow} />
                <Input label="Banner başlık" name="heroTitle" defaultValue={home.heroTitle} hint="Virgülden sonraki kısım vurgulu renkte gösterilir." />
              </div>
              <Textarea label="Banner metni" name="heroText" rows={3} defaultValue={home.heroText} />
              <div className="grid items-end gap-5 sm:grid-cols-[120px_1fr_1fr]">
                <div className="relative aspect-[6/5] overflow-hidden rounded-lg bg-sand">
                  <Image src={home.heroImage} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <label className="block">
                  <span className="label">Banner görseli (değiştirmek için seçin)</span>
                  <input type="file" name="heroImageFile" accept="image/*" className={fileClass} />
                </label>
                <Input label="Banner görsel açıklaması" name="heroImageAlt" defaultValue={home.heroImageAlt} />
              </div>
              <hr className="border-sand" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Hediye bölümü başlık" name="giftTitle" defaultValue={home.giftTitle} />
                <Input label="Hikâye bölümü başlık" name="storyTitle" defaultValue={home.storyTitle} />
              </div>
              <Textarea label="Hediye bölümü metni" name="giftText" rows={3} defaultValue={home.giftText} />
              <Textarea label="Hikâye bölümü metni" name="storyText" rows={5} defaultValue={home.storyText} />
              <div className="grid items-end gap-5 sm:grid-cols-[120px_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                  <Image src={home.storyImage} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <label className="block">
                  <span className="label">Hikâye görseli</span>
                  <input type="file" name="storyImageFile" accept="image/*" className={fileClass} />
                </label>
              </div>
              <Textarea label="Google arama açıklaması (ana sayfa)" name="seoDescription" rows={2} defaultValue={seo.homeDescription} hint="150–160 karakter idealdir." />
              <SubmitButton>Kaydet</SubmitButton>
            </AdminForm>
          </Panel>
        </section>

        <section id="hakkimizda" className="scroll-mt-6">
          <Panel title="Hakkımızda sayfası">
            <AdminForm action={saveAbout}>
              <Input label="Başlık" name="title" defaultValue={about.title} />
              <Textarea label="Giriş cümlesi" name="intro" rows={2} defaultValue={about.intro} />
              <Textarea label="Hikâye metni" name="body" rows={9} defaultValue={about.body} hint="Paragraflar arasında boş satır bırakın." />
              <div className="grid items-end gap-5 sm:grid-cols-[120px_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                  <Image src={about.image} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <label className="block">
                  <span className="label">Sayfa görseli</span>
                  <input type="file" name="imageFile" accept="image/*" className={fileClass} />
                </label>
              </div>
              <p className="label">Değerlerimiz (3 kutu)</p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                  <input name={`valueTitle_${i}`} defaultValue={about.values[i]?.title ?? ""} placeholder="Başlık" className="input" />
                  <input name={`valueText_${i}`} defaultValue={about.values[i]?.text ?? ""} placeholder="Açıklama" className="input" />
                </div>
              ))}
              <SubmitButton>Kaydet</SubmitButton>
            </AdminForm>
          </Panel>
        </section>

        <section id="instagram" className="scroll-mt-6">
          <Panel title="Instagram galerisi">
            <p className="mb-4 text-sm text-ink/65">
              Ana sayfada gösterilecek Instagram fotoğraflarını buradan ekleyin (en fazla 12). Instagram&apos;a otomatik bağlantı için Meta geliştirici
              hesabı gerekir; bu yöntem anahtar gerektirmez.
            </p>
            <AdminForm action={addInstagramPost} resetOnSuccess className="mb-6 grid gap-4 rounded-xl bg-cream/60 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <label className="block">
                <span className="label">Fotoğraf *</span>
                <input type="file" name="image" accept="image/*" required className={fileClass} />
              </label>
              <Input label="Gönderi bağlantısı" name="url" placeholder="https://www.instagram.com/p/…" />
              <Input label="Açıklama" name="alt" placeholder="Lavanta detaylı mum" />
              <SubmitButton>Ekle</SubmitButton>
            </AdminForm>
            {instagram.posts.length ? (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {instagram.posts.map((p, i) => (
                  <li key={p.image}>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">
                      <Image src={p.image} alt={p.alt} fill sizes="120px" className="object-cover" />
                    </div>
                    <form action={removeInstagramPost} className="mt-1 text-center">
                      <input type="hidden" name="index" value={i} />
                      <ConfirmSubmit message="Bu görsel galeriden kaldırılsın mı?" className="text-xs">Kaldır</ConfirmSubmit>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/60">Galeri boş. Boşken ana sayfada Instagram hesabınıza giden bir kart gösterilir.</p>
            )}
          </Panel>
        </section>

        <p className="text-sm text-ink/60">
          Müşteri yorumlarını <Link href="/yonetim/yorumlar" className="text-terracotta underline">Müşteri Yorumları</Link> bölümünden yönetebilirsiniz.
        </p>
      </div>
    </div>
  );
}

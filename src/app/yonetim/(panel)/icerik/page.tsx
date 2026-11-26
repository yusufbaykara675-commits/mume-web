import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { addInstagramPost, removeInstagramPost, saveAbout, saveBusiness, saveHome, saveHours, saveLegal } from "@/actions/admin/content";
import { AdminForm, ConfirmSubmit, SubmitButton } from "@/components/admin/AdminForm";
import { Checkbox, Input, PageHeader, Panel, Textarea } from "@/components/admin/ui";
import { DEFAULT_LEGAL_TEXTS, LEGAL_PAGES, legalText, type LegalSlug } from "@/lib/legal";
import { prisma } from "@/lib/db";
import { hasDatabase } from "@/lib/demo";
import { ImageInput } from "@/components/admin/ImageInput";
import { DEFAULT_PAYMENT_LOGOS } from "@/components/site/PaymentLogos";

export const metadata = { title: "Site İçeriği" };

const fileClass =
  "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ivory";

const sections = [
  ["isletme", "İşletme bilgileri"],
  ["saatler", "Çalışma saatleri"],
  ["anasayfa", "Ana sayfa & banner"],
  ["hakkimizda", "Hakkımızda"],
  ["instagram", "Instagram galerisi"],
  ["yasal", "Yasal metinler & iyzico"],
] as const;

export default async function ContentPage() {
  const { business, hours, home, about, instagram, seo, legal } = await getSettings(["business", "hours", "home", "about", "instagram", "seo", "legal"]);
  const pricedProducts = hasDatabase ? await prisma.product.count({ where: { isActive: true, priceCents: { not: null } } }) : 0;
  const activeProducts = hasDatabase ? await prisma.product.count({ where: { isActive: true } }) : 0;
  const slugs = Object.keys(LEGAL_PAGES) as LegalSlug[];
  const unfilled = slugs.filter((s) => /\[[^\]]+\]/.test(legalText(LEGAL_PAGES[s].key, business, legal)));
  const checklist: [boolean, string][] = [
    [activeProducts > 0 && pricedProducts === activeProducts, `Tüm ürünlerde fiyat var (${pricedProducts}/${activeProducts})`],
    [Boolean(legal.sellerTitle), "Satıcı adı soyadı / şirket unvanı girildi"],
    [Boolean(legal.taxOffice && legal.taxNumber), "Vergi dairesi ve numarası girildi"],
    [Boolean(business.phone && business.email), "Telefon ve e-posta girildi (İşletme bilgileri)"],
    [true, "iyzico ile Öde / Mastercard / Visa logo bandı sitenin altında gösteriliyor"],
    [unfilled.length === 0, unfilled.length ? `Doldurulmamış [ ] alanlar var: ${unfilled.map((s) => LEGAL_PAGES[s].title).join(", ")}` : "Yasal metinlerdeki tüm [ ] alanlar dolduruldu"],
    [true, "Gizlilik, Mesafeli Satış, Teslimat ve İade, Hakkımızda, İletişim sayfaları yayında"],
    [true, "SSL sertifikası (https) etkin"],
  ];
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
                  <ImageInput name="heroImageFile" className={fileClass} />
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
                  <ImageInput name="storyImageFile" className={fileClass} />
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
                  <ImageInput name="imageFile" className={fileClass} />
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
                <ImageInput name="image" required className={fileClass} />
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

        <section id="yasal" className="scroll-mt-6">
          <Panel title="iyzico başvuru kontrol listesi">
            <ul className="space-y-2 text-sm">
              {checklist.map(([ok, label]) => (
                <li key={label} className="flex items-start gap-2">
                  <span className={ok ? "text-olive" : "text-terracotta"} aria-hidden>{ok ? "✓" : "○"}</span>
                  <span className={ok ? "text-ink/70" : "font-medium text-espresso"}>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink/55">
              iyzico ayrıca sattığınız ürünler için gerekli izin ve belgeleri, başvuru sırasında vergi levhası ve kimlik/imza belgelerini ister.
              Online ödeme sözleşme ve teknik entegrasyon tamamlanana kadar kapalı kalır.
            </p>
          </Panel>

          <Panel title="Yasal metinler ve ödeme logoları" className="mt-6">
            <AdminForm action={saveLegal}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Satıcı adı soyadı / şirket unvanı" name="sellerTitle" defaultValue={legal.sellerTitle} className="sm:col-span-2" hint="Vergi levhasındaki unvanla aynı olmalı." />
                <Input label="Vergi dairesi" name="taxOffice" defaultValue={legal.taxOffice} placeholder="Van Vergi Dairesi" />
                <Input label="Vergi numarası / TCKN" name="taxNumber" defaultValue={legal.taxNumber} inputMode="numeric" />
                <Input label="MERSİS numarası (şirketse)" name="mersisNumber" defaultValue={legal.mersisNumber} inputMode="numeric" />
              </div>

              <div className="grid items-end gap-5 sm:grid-cols-[260px_1fr]">
                <div className="flex h-12 items-center justify-center rounded-lg border border-sand bg-white px-2">
                  <div className="relative h-8 w-full">
                    <Image src={legal.paymentLogos || DEFAULT_PAYMENT_LOGOS} alt="" fill sizes="260px" className="object-contain" />
                  </div>
                </div>
                <label className="block">
                  <span className="label">Farklı bir logo bandı yükle (isteğe bağlı, PNG)</span>
                  <input type="file" name="paymentLogosFile" accept="image/png,image/webp,image/jpeg" className={fileClass} />
                  <span className="mt-1 block text-xs text-ink/55">
                    Şu an iyzico&apos;nun resmî logo bandı kullanılıyor. Değiştirmek gerekmez; güncel paket için:{" "}
                    <a href="https://docs.iyzico.com/ek-bilgiler/iyzico-logo-paketi" target="_blank" rel="noopener noreferrer" className="text-terracotta underline">
                      logo paketini indir
                    </a>
                  </span>
                </label>
              </div>
              {legal.paymentLogos && legal.paymentLogos !== DEFAULT_PAYMENT_LOGOS && <Checkbox name="removePaymentLogos" label="Yüklediğim bandı kaldır (resmî banda dön)" />}

              <p className="text-sm text-ink/65">
                Metinlerde <strong>[köşeli parantez]</strong> içindeki kısımları kendi bilgilerinizle değiştirin. <code>{"{{SATICI}}"}</code>,{" "}
                <code>{"{{ADRES}}"}</code>, <code>{"{{TELEFON}}"}</code>, <code>{"{{EPOSTA}}"}</code>, <code>{"{{VERGI}}"}</code> gibi etiketler
                otomatik doldurulur. Başlık için satır başına &quot;## &quot;, madde için &quot;- &quot; yazın. Metni tamamen silerseniz şablon geri gelir.
                Bu metinler şablondur; yayına almadan önce bir hukuk danışmanına kontrol ettirmeniz önerilir.
              </p>
              {slugs.map((s) => {
                const key = LEGAL_PAGES[s].key;
                return (
                  <Textarea
                    key={s}
                    label={LEGAL_PAGES[s].title}
                    name={key}
                    rows={12}
                    defaultValue={legal.texts[key] || DEFAULT_LEGAL_TEXTS[key]}
                    hint={`Sitede: /${s}`}
                    className="input font-mono text-xs!"
                  />
                );
              })}
              <p className="text-xs text-ink/55">Şu anki sürüm: {legal.version}. Metni değiştirdiğinizde yeni sürüm oluşur ve siparişlerde hangi sürümün onaylandığı kaydedilir.</p>
              <SubmitButton>Kaydet</SubmitButton>
            </AdminForm>
          </Panel>
        </section>

        <p className="text-sm text-ink/60">
          Müşteri yorumlarını <Link href="/yonetim/yorumlar" className="text-terracotta underline">Müşteri Yorumları</Link> bölümünden yönetebilirsiniz.
        </p>
      </div>
    </div>
  );
}

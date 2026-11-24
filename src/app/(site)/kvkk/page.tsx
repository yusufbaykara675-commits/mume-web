import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { KVKK_TEXT_VERSION } from "@/lib/site";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  alternates: { canonical: "/kvkk" },
};

/**
 * ŞABLON METİN — yayına almadan önce bir hukuk danışmanına kontrol ettirin.
 * Köşeli parantez içindeki alanları (veri sorumlusu unvanı, VKN/MERSİS vb.) doldurun.
 * Metni değiştirdiğinizde src/lib/site.ts içindeki KVKK_TEXT_VERSION değerini güncelleyin.
 */
export default async function KvkkPage() {
  const b = await getSetting("business");
  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-5xl">KVKK Aydınlatma Metni</h1>
      <p className="mt-2 text-xs text-ink/50">Sürüm: {KVKK_TEXT_VERSION}</p>
      <div className="prose-mume mt-8">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla{" "}
          <strong>[İşletme sahibinin adı soyadı / şirket unvanı]</strong> (&quot;{b.name}&quot;) olarak, kişisel verilerinizi aşağıda açıklanan
          kapsamda işlemekteyiz.
        </p>

        <h2>1. İşlenen kişisel veriler</h2>
        <ul>
          <li>Kimlik ve iletişim: ad soyad, telefon numarası, e-posta adresi</li>
          <li>Teslimat: şehir ve açık adres (kargo ile gönderim seçildiğinde)</li>
          <li>İşlem bilgileri: sipariş içeriği, workshop rezervasyon bilgileri, mesaj içerikleri ve notlarınız</li>
          <li>İşlem güvenliği: IP adresi (kötüye kullanımı önlemek amacıyla, kısa süreli)</li>
        </ul>

        <h2>2. İşleme amaçları</h2>
        <ul>
          <li>Siparişlerinizin alınması, hazırlanması ve teslim edilmesi</li>
          <li>Workshop rezervasyonlarınızın alınması, onaylanması ve sizinle iletişim kurulması</li>
          <li>İletişim formu ile gönderdiğiniz taleplere yanıt verilmesi</li>
          <li>Yasal yükümlülüklerin (fatura, muhasebe vb.) yerine getirilmesi</li>
          <li>Açık rızanız olması hâlinde yeni ürün ve workshop duyurularının iletilmesi</li>
        </ul>

        <h2>3. Hukuki sebepler</h2>
        <p>
          Kişisel verileriniz KVKK m.5/2 kapsamında; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması, veri sorumlusunun hukuki
          yükümlülüğünü yerine getirebilmesi ve meşru menfaat hukuki sebeplerine dayanılarak; duyuru iletimi ise açık rızanıza dayanılarak işlenir.
        </p>

        <h2>4. Aktarım</h2>
        <p>
          Verileriniz; teslimat için kargo firmalarına, sitenin barındırıldığı hizmet sağlayıcılara ve yasal zorunluluk hâlinde yetkili kamu
          kurumlarına, amaçla sınırlı olarak aktarılabilir. Sipariş ve rezervasyon özetini WhatsApp ile göndermeyi seçtiğinizde, mesaj
          WhatsApp (Meta) altyapısı üzerinden iletilir. <strong>[Kullanılan barındırma hizmeti ve sunucu konumu buraya yazılmalıdır.]</strong>
        </p>

        <h2>5. Saklama süresi</h2>
        <p>
          Verileriniz işleme amacının gerektirdiği süre ve ilgili mevzuattaki zamanaşımı süreleri boyunca saklanır, ardından silinir, yok edilir
          veya anonim hâle getirilir. <strong>[Saklama süreleri hukuk danışmanıyla netleştirilmelidir.]</strong>
        </p>

        <h2>6. Haklarınız</h2>
        <p>
          KVKK m.11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, aktarıldığı
          üçüncü kişileri öğrenme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi{" "}
          {b.email ? <strong>{b.email}</strong> : <strong>[e-posta adresi]</strong>} adresine veya {b.addressLine}, {b.city} adresine
          yazılı olarak iletebilirsiniz.
        </p>
      </div>
    </article>
  );
}

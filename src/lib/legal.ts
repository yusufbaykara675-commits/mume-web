import type { Settings } from "./settings";
import { SITE_URL } from "./site";

/**
 * Yasal sayfalar (iyzico ve mesafeli satış mevzuatı için gerekli).
 *
 * ŞABLON METİNLER — yayına almadan önce bir hukuk danışmanına kontrol ettirin.
 * Köşeli parantez [ ... ] içindeki kısımlar işletmeye özel bilgilerdir; yönetim
 * panelinde İçerik > Yasal metinler bölümünden doldurulmalıdır. Uydurulmuş bir
 * kargo ücreti, teslim süresi veya iade koşulu yoktur.
 *
 * Metin içinde şu etiketler satıcı bilgileriyle otomatik değiştirilir:
 * {{SATICI}} {{ADRES}} {{TELEFON}} {{EPOSTA}} {{VERGI}} {{MERSIS}} {{SITE}}
 *
 * Biçim: "## " başlık, "- " madde, boş satır paragraf, **kalın**.
 */

export const LEGAL_PAGES = {
  "on-bilgilendirme-formu": { key: "preInfo", title: "Ön Bilgilendirme Formu" },
  "mesafeli-satis-sozlesmesi": { key: "distanceSales", title: "Mesafeli Satış Sözleşmesi" },
  "teslimat-ve-iade": { key: "deliveryReturns", title: "Teslimat ve İade Koşulları" },
  "gizlilik-politikasi": { key: "privacy", title: "Gizlilik Politikası" },
} as const;

export type LegalSlug = keyof typeof LEGAL_PAGES;
export type LegalTextKey = (typeof LEGAL_PAGES)[LegalSlug]["key"];

const sellerBlock = `## Satıcı bilgileri
- Unvan / Ad Soyad: {{SATICI}}
- Adres: {{ADRES}}
- Telefon: {{TELEFON}}
- E-posta: {{EPOSTA}}
- Vergi dairesi ve numarası: {{VERGI}}
- MERSİS numarası (şirketse): {{MERSIS}}
- Web sitesi: {{SITE}}`;

export const DEFAULT_LEGAL_TEXTS: Record<LegalTextKey, string> = {
  preInfo: `Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, sipariş verilmeden önce alıcının bilgilendirilmesi amacıyla hazırlanmıştır.

${sellerBlock}

## Ürün, fiyat ve ödeme
Satın alınan ürünlerin adı, adedi, rengi/kokusu, vergiler dahil satış fiyatı ve toplam tutar, sipariş sırasında oluşturulan sipariş özetinde yer alır ve bu formun ayrılmaz parçasıdır.

- Ödeme yöntemleri: **[Havale/EFT, kredi kartı (iyzico) vb. — kullandığınız yöntemleri yazın]**
- Kargo ücreti: **[Kargo ücretini veya hangi tutarın üzerinde ücretsiz olduğunu yazın]**

## Teslimat
Ürünler, alıcının sipariş sırasında belirttiği adrese kargo ile gönderilir veya atölyeden teslim alınır. Teslim süresi **[ör. siparişin onaylanmasından itibaren X iş günü]** olup yasal üst sınır olan 30 günü geçemez.

## Cayma hakkı
Alıcı, ürünü teslim aldığı günden itibaren **14 gün** içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayma hakkına sahiptir. Cayma bildirimi bu süre içinde {{EPOSTA}} adresine veya {{TELEFON}} numarasına yazılı olarak iletilebilir.

## Cayma hakkının kullanılamayacağı durumlar
Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca; alıcının istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünlerde (ör. isim, tarih veya özel tasarım ile kişiselleştirilmiş mumlar) cayma hakkı kullanılamaz.

## Şikâyet ve başvuru
Alıcı, talep ve şikâyetlerini yukarıdaki iletişim bilgileri üzerinden satıcıya iletebilir. Uyuşmazlık hâlinde Ticaret Bakanlığınca her yıl ilan edilen parasal sınırlar dahilinde alıcının yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetine ya da Tüketici Mahkemesine başvurulabilir.`,

  distanceSales: `## 1. Taraflar
**Satıcı**

- Unvan / Ad Soyad: {{SATICI}}
- Adres: {{ADRES}}
- Telefon: {{TELEFON}}
- E-posta: {{EPOSTA}}
- Vergi dairesi ve numarası: {{VERGI}}
- MERSİS numarası (şirketse): {{MERSIS}}

**Alıcı**

Sipariş formunda adı, iletişim ve teslimat bilgileri yer alan kişidir.

## 2. Konu
Bu sözleşmenin konusu, alıcının {{SITE}} üzerinden elektronik ortamda sipariş verdiği, nitelikleri ve satış fiyatı sipariş özetinde belirtilen ürünlerin satışı ve teslimine ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

## 3. Ürün bilgileri
Ürünlerin türü, adedi, rengi/kokusu, vergiler dahil satış fiyatı, kargo ücreti ve toplam tutar sipariş özetinde yer alır. El yapımı ürünlerde renk, desen ve çiçek yerleşiminde ürün fotoğraflarına göre küçük farklılıklar olabilir.

## 4. Ödeme
Ödeme, **[kullanılan ödeme yöntemlerini yazın: Havale/EFT, kredi kartı (iyzico) vb.]** ile yapılır. Kredi kartı ile yapılan ödemelerde kart bilgileri satıcı tarafından görülmez ve saklanmaz; ödeme, lisanslı ödeme kuruluşunun güvenli altyapısında işlenir.

## 5. Teslimat
- Ürünler alıcının belirttiği adrese kargo ile gönderilir veya atölyeden teslim alınır.
- Teslim süresi **[ör. X iş günü]** olup yasal üst sınır olan 30 günü geçemez.
- Kargo ücreti: **[kargo ücretini yazın]**
- **[Teslimatta paketin kontrol edilmesi ve hasarlı teslimatta ne yapılacağına ilişkin kuralınızı yazın]**

## 6. Cayma hakkı
Alıcı, ürünü teslim aldığı günden itibaren 14 gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilir. Cayma bildirimi bu süre içinde satıcıya yazılı olarak (e-posta veya mesaj) iletilir.

- Alıcı, cayma bildirimini ilettiği tarihten itibaren 10 gün içinde ürünü satıcıya geri gönderir.
- Satıcı, cayma bildiriminin kendisine ulaştığı tarihten itibaren 14 gün içinde ürün bedelini alıcıya, ödemenin yapıldığı yöntemle iade eder.
- İade kargo ücreti: **[İade kargo ücretinin kime ait olduğunu ve anlaşmalı kargo firmanızı yazın]**

## 7. Cayma hakkının istisnaları
Alıcının istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünlerde (isim, tarih veya özel tasarımla kişiselleştirilmiş mumlar dahil) cayma hakkı kullanılamaz.

## 8. Uyuşmazlıkların çözümü
Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığınca her yıl ilan edilen parasal sınırlar dahilinde Tüketici Hakem Heyetleri, bu sınırları aşan durumlarda Tüketici Mahkemeleri yetkilidir.

## 9. Yürürlük
Alıcı, siparişi onaylamadan önce Ön Bilgilendirme Formu'nu ve bu sözleşmeyi okuduğunu ve kabul ettiğini beyan eder. Sözleşme, siparişin oluşturulmasıyla kurulmuş sayılır.`,

  deliveryReturns: `## Teslimat
- Siparişler **[hazırlık süresini yazın, ör. X iş günü]** içinde hazırlanıp kargoya verilir. Teslim süresi hiçbir durumda 30 günü geçmez.
- Kargo firması: **[çalıştığınız kargo firmasını yazın]**
- Kargo ücreti: **[kargo ücretini veya ücretsiz kargo koşulunu yazın]**
- Van içinde atölyeden teslim almak mümkündür: {{ADRES}}

Mumlar kırılabilir ve ısıya duyarlı ürünlerdir; özenle paketlenerek gönderilir. **[Teslimatta paketin kontrolüne ve hasarlı ürün bildirimine ilişkin kuralınızı yazın.]**

## İade ve cayma hakkı
Ürünü teslim aldığınız günden itibaren 14 gün içinde herhangi bir gerekçe göstermeden cayma hakkınızı kullanabilirsiniz.

- Cayma bildiriminizi {{EPOSTA}} adresine veya {{TELEFON}} numarasına yazılı olarak iletin.
- Bildirimden itibaren 10 gün içinde ürünü, kullanılmamış hâlde geri gönderin.
- Bedel, bildiriminizin bize ulaştığı tarihten itibaren 14 gün içinde ödemeyi yaptığınız yöntemle iade edilir.
- İade kargo ücreti: **[kime ait olduğunu yazın]**

## İade edilemeyen ürünler
İsim, tarih veya size özel tasarım ile kişiselleştirilerek hazırlanan ürünlerde, mevzuat gereği cayma hakkı kullanılamaz.

## Ayıplı (kusurlu) ürün
Ürün hasarlı veya kusurlu ulaştıysa lütfen fotoğrafıyla birlikte bizimle iletişime geçin. 6502 sayılı Kanun'dan doğan seçimlik haklarınız saklıdır.`,

  privacy: `Bu politika, {{SITE}} adresini ziyaret ettiğinizde ve bizimle sipariş, rezervasyon veya iletişim formu aracılığıyla paylaştığınız bilgilerin nasıl korunduğunu açıklar. Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için KVKK Aydınlatma Metni'ni inceleyebilirsiniz.

## Topladığımız bilgiler
- Sipariş ve rezervasyon için: ad soyad, telefon, e-posta, teslimat adresi ve notlarınız
- İletişim formu için: adınız, iletişim bilginiz ve mesajınız
- Güvenlik için: kötüye kullanımı önlemek amacıyla kısa süreli IP adresi kaydı

## Ödeme bilgileri
Kredi kartı bilgileriniz sitemizde tutulmaz ve tarafımızca görülmez. Online ödeme etkin olduğunda kart bilgileri, lisanslı ödeme kuruluşunun 3D Secure destekli güvenli ödeme sayfasında işlenir.

## Güvenlik
Sitemizdeki tüm sayfalar SSL sertifikası ile şifreli bağlantı (https) üzerinden sunulur.

## Paylaşım
Bilgileriniz yalnızca siparişinizin teslimi, rezervasyonunuzun yönetimi ve yasal yükümlülükler için gerekli olduğu ölçüde (ör. kargo firması, barındırma hizmeti, yetkili kamu kurumları) paylaşılır. Bilgileriniz satılmaz veya reklam amacıyla üçüncü kişilere verilmez.

## Çerezler
Sitemiz yalnızca çalışması için zorunlu teknik depolama kullanır. Ayrıntılar için Çerez Politikası'na bakabilirsiniz.

## İletişim
Gizlilikle ilgili sorularınız için: {{EPOSTA}} · {{TELEFON}} · {{ADRES}}`,
};

const missing = (label: string) => `[${label}]`;

export function legalVars(business: Settings["business"], legal: Settings["legal"]) {
  const address = [business.addressLine, business.district, business.city].filter(Boolean).join(", ");
  const tax = [legal.taxOffice, legal.taxNumber].filter(Boolean).join(" / ");
  return {
    SATICI: legal.sellerTitle || missing("Satıcı adı soyadı veya şirket unvanı"),
    ADRES: address || missing("Açık adres"),
    TELEFON: business.phone || missing("Telefon"),
    EPOSTA: business.email || missing("E-posta"),
    VERGI: tax || missing("Vergi dairesi / numarası"),
    MERSIS: legal.mersisNumber || "—",
    SITE: SITE_URL.replace(/^https?:\/\//, ""),
  } as Record<string, string>;
}

export function legalText(key: LegalTextKey, business: Settings["business"], legal: Settings["legal"]): string {
  const raw = legal.texts[key]?.trim() || DEFAULT_LEGAL_TEXTS[key];
  const vars = legalVars(business, legal);
  return raw.replace(/\{\{([A-Z]+)\}\}/g, (m, name: string) => vars[name] ?? m);
}

/** Basit metin → blok dönüşümü (HTML üretmez; React ile güvenli şekilde gösterilir). */
export type LegalBlock = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

export function parseLegal(text: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let list: string[] = [];
    const flush = () => {
      if (para.length) blocks.push({ type: "p", text: para.join(" ") });
      if (list.length) blocks.push({ type: "ul", items: list });
      para = [];
      list = [];
    };
    for (const line of lines) {
      if (line.startsWith("## ")) {
        flush();
        blocks.push({ type: "h2", text: line.slice(3) });
      } else if (line.startsWith("- ")) {
        if (para.length) {
          blocks.push({ type: "p", text: para.join(" ") });
          para = [];
        }
        list.push(line.slice(2));
      } else {
        if (list.length) {
          blocks.push({ type: "ul", items: list });
          list = [];
        }
        para.push(line);
      }
    }
    flush();
  }
  return blocks;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  alternates: { canonical: "/cerez-politikasi" },
};

export default function CookiePolicyPage() {
  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-5xl">Çerez Politikası</h1>
      <div className="prose-mume mt-8">
        <p>
          Sitemiz reklam, profil oluşturma veya üçüncü taraf takip çerezi kullanmaz. Yalnızca sitenin çalışması için zorunlu olan teknik depolama
          kullanılır:
        </p>
        <ul>
          <li>
            <strong>Sepet bilgisi</strong> — tarayıcınızın yerel depolamasında (localStorage) tutulur, sunucuya yalnızca siparişi
            gönderdiğinizde iletilir.
          </li>
          <li>
            <strong>Bilgilendirme tercihi</strong> — çerez bildirimini kapattığınızı hatırlamak için yerel depolamada tutulur.
          </li>
          <li>
            <strong>Yönetici oturum çerezi</strong> — yalnızca yönetim paneline giriş yapan site yöneticileri için kullanılır.
          </li>
        </ul>
        <p>
          İletişim ve ana sayfadaki harita, Google Haritalar tarafından sağlanır ve Google&apos;ın kendi çerez politikalarına tabidir. Tarayıcı
          ayarlarınızdan yerel depolamayı dilediğiniz zaman temizleyebilirsiniz.
        </p>
        <p>
          İleride ziyaretçi istatistiği gibi zorunlu olmayan çerezler eklenirse, bu çerezler yalnızca açık onayınız alındıktan sonra
          çalıştırılacaktır.
        </p>
      </div>
    </article>
  );
}

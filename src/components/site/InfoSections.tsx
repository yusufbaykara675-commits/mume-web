import Link from "next/link";

/** Ana sayfa altındaki güven şeridi — yalnızca doğrulanabilir, genel bilgiler. */
const TRUST = [
  {
    title: "El yapımı",
    text: "Van'daki atölyemizde, küçük partiler hâlinde",
    icon: (
      <path d="M12 3c2 3 4 4.5 4 7.5a4 4 0 01-8 0C8 7.5 10 6 12 3zM8 20h8M10 16v4M14 16v4" />
    ),
  },
  {
    title: "Kişiye özel",
    text: "İsim, tarih ya da kısa notla tasarım",
    icon: <path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" />,
  },
  {
    title: "Hediyeye hazır",
    text: "Özenli paketiyle gönderilmeye hazır",
    icon: <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-6-3-6 0M12 7c2-3 6-3 6 0" />,
  },
  {
    title: "WhatsApp ile kolay sipariş",
    text: "Sorularınıza doğrudan bizden yanıt",
    icon: <path d="M4 20l1.5-4A8 8 0 1112 20a8 8 0 01-4-1L4 20z" />,
  },
];

export function TrustBar() {
  return (
    <section aria-label="Neden MuMê" className="border-y border-sand bg-ivory">
      <ul data-stagger="90" className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {TRUST.map((t) => (
          <li key={t.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cream text-terracotta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {t.icon}
              </svg>
            </span>
            <span>
              <span className="block text-sm font-semibold text-espresso">{t.title}</span>
              <span className="block text-xs leading-relaxed text-ink/65">{t.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Mumunuzu seçin", text: "Koleksiyondan beğendiğiniz mumu, rengini ve adedini seçip sepete ekleyin." },
  { n: "02", title: "Kişiselleştirin", text: "İsim, tarih ya da hediye notunuzu sipariş notuna yazın." },
  { n: "03", title: "WhatsApp'tan onaylayın", text: "Sipariş özetiniz hazır mesajla bize ulaşır; ödeme ve teslimatı birlikte netleştiririz." },
  { n: "04", title: "Özenle hazırlayalım", text: "Mumunuz atölyemizde hazırlanır, paketlenir ve size ulaştırılır." },
];

export function HowToOrder() {
  return (
    <section className="bg-cream/60 py-20 md:py-24">
      <div className="container-page">
        <div data-reveal="up" className="mb-12 max-w-2xl">
          <p className="eyebrow mb-3">Nasıl sipariş verilir?</p>
          <h2 className="text-4xl leading-[1.05] md:text-5xl">Dört adımda, sıcacık bir hediye</h2>
        </div>
        <ol data-stagger="110" className="grid gap-5 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-[var(--radius-card)] bg-ivory p-7 shadow-[var(--shadow-soft)]">
              <span className="font-serif text-5xl italic text-terracotta/80">{s.n}</span>
              <p className="mt-3 font-serif text-2xl text-espresso">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.text}</p>
            </li>
          ))}
        </ol>
        <div data-reveal="up" className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/urunler" className="btn-primary">
            Koleksiyonu Keşfet
          </Link>
          <Link href="/iletisim" className="btn-outline">
            Bir sorunuz mu var?
          </Link>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Mumları kişiye özel hazırlıyor musunuz?",
    a: "Evet. İsim, tarih ya da kısa bir notla kişiselleştirilmiş mumlar hazırlıyoruz. İsteğinizi sipariş notuna yazmanız ya da WhatsApp'tan bize iletmeniz yeterli.",
  },
  {
    q: "Siparişimi nasıl tamamlarım, ödemeyi nasıl yaparım?",
    a: "Sepetinizi oluşturup bilgilerinizi girdiğinizde sipariş özetiniz WhatsApp üzerinden bize iletilir. Ödeme ve teslimat detaylarını orada sizinle birlikte netleştiririz.",
  },
  {
    q: "Van dışına gönderim yapıyor musunuz?",
    a: "Kargo ile gönderim seçeneği sunuyoruz. Kargo ücreti ve tahmini teslim süresi, sipariş teyidi sırasında size bildirilir. Van'dan atölyemizden teslim almayı da seçebilirsiniz.",
  },
  {
    q: "Workshop'a katılmak için deneyim gerekiyor mu?",
    a: "Hayır. Workshoplarımız herkes içindir; tüm adımları birlikte, uygulamalı olarak yapıyoruz. Grup ve özel organizasyon talepleriniz için bize yazabilirsiniz.",
  },
  {
    q: "Mumumu ilk kez nasıl yakmalıyım?",
    a: "İlk yakışta, mumun yüzeyindeki erimiş tabaka kenarlara ulaşana kadar yanmasına izin verin; bu, mumun düzgün ve uzun yanmasını sağlar. Her yakıştan önce fitili yaklaşık 5 mm olacak şekilde kısaltın.",
  },
];

export function FaqSection() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <div data-reveal="left" className="lg:col-span-4">
          <p className="eyebrow mb-3">Sıkça sorulanlar</p>
          <h2 className="text-4xl leading-[1.05] md:text-5xl">Aklınıza takılanlar</h2>
          <p className="mt-4 text-ink/70">Burada yanıtını bulamadığınız her şey için bize yazabilirsiniz.</p>
          <Link href="/iletisim" className="btn-outline mt-6">
            İletişime geçin
          </Link>
        </div>
        <div data-stagger="80" className="divide-y divide-sand border-y border-sand lg:col-span-8">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl text-espresso marker:hidden [&::-webkit-details-marker]:hidden md:text-2xl">
                {f.q}
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-beige text-lg transition group-open:rotate-45 group-open:bg-espresso group-open:text-ivory" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Ürün sayfasındaki açılır bilgi kutuları */
export function ProductInfo() {
  const items = [
    {
      t: "Teslimat",
      d: "Kargo ile gönderim veya Van'da atölyeden teslim alma seçenekleri vardır. Kargo ücreti ve tahmini teslim süresi sipariş teyidinde bildirilir.",
    },
    {
      t: "Kişiselleştirme",
      d: "İsim, tarih veya kısa bir not eklemek isterseniz sipariş notuna yazabilir ya da WhatsApp'tan bize iletebilirsiniz.",
    },
    {
      t: "Mum bakımı ve güvenlik",
      d: "İlk yakışta erimiş tabakanın kenarlara ulaşmasını bekleyin. Fitili her yakıştan önce yaklaşık 5 mm'ye kısaltın. Yanan mumu gözetimsiz bırakmayın; çocuklardan, evcil hayvanlardan ve yanıcı maddelerden uzak, düz bir zeminde kullanın.",
    },
  ];
  return (
    <div className="mt-8 divide-y divide-sand border-y border-sand">
      {items.map((i) => (
        <details key={i.t} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-espresso marker:hidden [&::-webkit-details-marker]:hidden">
            {i.t}
            <span className="text-lg transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{i.d}</p>
        </details>
      ))}
    </div>
  );
}

# MuMê Mum Atölyesi — Web Sitesi

Butik mum mağazası + workshop rezervasyon sistemi + Türkçe yönetim paneli.
Next.js 15 · TypeScript · Tailwind CSS 4 · PostgreSQL · Prisma · React Hook Form · Zod

## Neler var?

| Bölüm | Adres | Açıklama |
|---|---|---|
| Ana sayfa | `/` | Banner, kategoriler, öne çıkan ürünler, hediye bandı, workshoplar, hikâye, (gerçek yorum varsa) yorumlar, Instagram, konum |
| Koleksiyon | `/urunler` | Kategori filtresi, arama, sıralama |
| Ürün | `/urunler/[slug]` | Çoklu fotoğraf, renk/koku seçimi, adet, sepete ekle, WhatsApp ile sor, benzer ürünler |
| Sepet | `/sepet` | Müşteri bilgisi + KVKK onayı → sipariş kaydı → hazır mesajla WhatsApp'a geçiş |
| Workshoplar | `/workshoplar`, `/workshoplar/[slug]` | Tarih seçimi, kişi sayısı, kapasite kontrollü rezervasyon talebi |
| Rezervasyon | `/rezervasyon/[kod]` | Müşterinin onay/durum sayfası |
| Hakkımızda, İletişim, KVKK, Çerez | | Panelden düzenlenebilir metinler, harita, iletişim formu |
| Yönetim | `/yonetim` | Şifre korumalı Türkçe panel |

### Yönetim paneli
Genel bakış (istatistikler) · Siparişler (durum, ödeme, stok düşümü) · Rezervasyonlar (onay/red) · Ürünler (fotoğraf yükleme, sıralama, fiyat, stok, seçenekler) · Kategoriler · Workshoplar (tarih + kapasite) · Mesajlar · Site içeriği (işletme bilgisi, çalışma saatleri, banner, hakkımızda, Instagram galerisi) · Müşteri yorumları · Şifre değiştirme

### Önemli davranışlar
- **Fiyatlar uydurulmadı.** Örnek ürünlerde fiyat boştur; sitede “Fiyat için yazın” görünür. Panelden girin.
- **Örnek içerik işaretlidir.** Örnek ürün/workshoplar panelde “Örnek” rozetiyle görünür; panel sizi uyarır.
- **Örnek workshop tarihleri kapalıdır.** Gerçek tarih ekleyip “Yayında” işaretleyince rezervasyona açılır.
- **Yorum bölümü gizlidir**, panelden gerçek bir yorum yayınlanana kadar.
- **Tutar her zaman sunucuda hesaplanır**; sepetteki fiyatlara güvenilmez.
- **Stok**, sipariş panelde ilk kez onaylandığında düşülür; iptal edilirse geri eklenir.
- **Kapasite aşımı engellenir**: rezervasyon sırasında oturum satırı kilitlenir (eşzamanlı taleplerde bile).
- **Online ödeme kapalıdır.** iyzico/PayTR için mimari hazır (`src/lib/payments`). Ödeme yalnızca doğrulanmış sağlayıcı bildirimiyle “ödendi” sayılır.

## Bilgisayarda çalıştırma

Gerekenler: Node.js 20.9+ ve PostgreSQL (ya da Docker).

```bash
cp .env.example .env          # değerleri doldurun (AUTH_SECRET, ADMIN_*, DATABASE_URL)
npm install
npx prisma migrate dev --name ilk-kurulum   # tabloları oluşturur, prisma/migrations klasörünü üretir
npm run db:seed               # kategoriler, örnek ürünler, örnek workshop, yönetici hesabı
npm run dev                   # http://localhost:3000  ·  panel: http://localhost:3000/yonetim
```

Hızlı bir PostgreSQL için: `docker run -d --name mume-db -e POSTGRES_PASSWORD=yerel -e POSTGRES_USER=mume -e POSTGRES_DB=mume -p 5432:5432 postgres:16-alpine`

`prisma/migrations` klasörünü GitHub'a ekleyin; sunucu açılışta bu geçişleri otomatik uygular.

## Yayına alma
Ayrıntılı, adım adım rehber: **[DEPLOY.md](./DEPLOY.md)** (alan adı, DNS, HTTPS, e-posta kayıtlarını koruma).

## Klasör yapısı

```
prisma/              şema ve örnek veri
src/app/(site)/      herkese açık sayfalar
src/app/yonetim/     yönetim paneli
src/actions/         sunucu işlemleri (sipariş, rezervasyon, panel)
src/components/      arayüz bileşenleri
src/lib/             veritabanı, oturum, depolama, SEO, WhatsApp, ödeme altyapısı
src/i18n/            dil dosyaları (İngilizce eklemeye hazır)
public/brand/        logo ve paylaşım görselleri
```

## Yayından önce kontrol listesi
- [ ] Panel > Site İçeriği: WhatsApp numarası, telefon, e-posta, çalışma saatleri
- [ ] Örnek ürünleri gerçek ürün, fotoğraf ve fiyatlarla değiştirin (veya silin)
- [ ] Workshop bilgilerini, ücretini ve gerçek tarihlerini girin
- [ ] Banner ve hikâye fotoğraflarını yükleyin
- [ ] `/kvkk` metnindeki köşeli parantezli alanları doldurun ve bir hukukçuya kontrol ettirin (`src/app/(site)/kvkk/page.tsx`)
- [ ] Yönetici şifresini panelden değiştirin
- [ ] Google Search Console'a `https://mumeatolye.com/sitemap.xml` ekleyin

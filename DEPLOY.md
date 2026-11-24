# mume.com — Yayına Alma Rehberi

Bu rehber; alan adının nerede yönetildiğini bulmayı, düşük maliyetli bir barındırma seçmeyi, siteyi yayına almayı ve
**Google Workspace e-postalarını bozmadan** mume.com'u bağlamayı adım adım anlatır.

> ⚠️ **Altın kural:** DNS'te yalnızca `@` (mume.com) ve `www` için A / AAAA / CNAME kayıtlarını değiştirin.
> **MX, SPF (TXT), DKIM (`google._domainkey`), DMARC (`_dmarc`) ve `google-site-verification` kayıtlarına dokunmayın.**
> Değişiklikten önce tüm DNS kayıtlarının ekran görüntüsünü alın.

---

## 1. Alan adı nerede kayıtlı, DNS'i kim yönetiyor?

Google Workspace üzerinden alınan alan adları artık Google tarafından değil, **Squarespace Domains** tarafından yönetiliyor:
Google Domains'in tüm kayıtları Squarespace'e devredildi ve göç 10 Temmuz 2024'te tamamlandı. Kesin cevap için şu üç kontrolü yapın:

1. **Kayıt firması (registrar):** <https://lookup.icann.org> adresine `mume.com` yazın. *Registrar* satırı alan adının nerede kayıtlı olduğunu gösterir
   (ör. Squarespace).
2. **DNS sağlayıcısı:** Aynı sorgudaki *Name Servers* satırına bakın.
   - `ns-cloud-*.googledomains.com` → DNS Squarespace üzerinden yönetiliyor (Google altyapısında).
   - `*.squarespacedns.com` → Squarespace DNS.
   - `*.ns.cloudflare.com` → Cloudflare.
3. **Google Yönetici Konsolu:** <https://admin.google.com> → *Hesap* → *Alan adları* → *Alan adlarını yönet*. Alan adının yanında
   “Squarespace'te yönet” gibi bir bağlantı görürseniz DNS'i oradan düzenlersiniz (<https://account.squarespace.com/domains>).

Sonuç: Büyük olasılıkla DNS kayıtlarını **Squarespace Domains panelindeki “DNS” bölümünden** düzenleyeceksiniz.
Ad sunucularını (nameserver) değiştirmeniz **gerekmez**.

---

## 2. Barındırma seçimi (önerilen: tek küçük sunucu)

| Seçenek | Aylık maliyet (yaklaşık) | Artı | Eksi |
|---|---|---|---|
| **A) Küçük VPS + Docker (önerilen)** | Hetzner, DigitalOcean, Contabo gibi sağlayıcılarda 2 GB RAM'li en küçük sunucular düşük bir aylık ücretle bulunur — güncel fiyatı sağlayıcıdan kontrol edin | Site + veritabanı + fotoğraflar tek yerde, tek fatura, sınırsız ürün/fotoğraf | Yedekleri sizin almanız gerekir (aşağıda komutu var) |
| **B) Vercel Pro + yönetilen PostgreSQL + Cloudflare R2** | Vercel Pro aylık ücreti + veritabanı (Neon/Supabase ücretsiz katmanlarla başlanabilir) | Sunucu yönetimi yok | Vercel'in **ücretsiz Hobby planı ticari kullanıma kapalıdır**; bir mağaza için Pro gerekir. Fotoğraflar için ayrıca R2/S3 gerekir |

> Vercel'in kullanım koşullarına göre Hobby ekipler yalnızca kişisel, ticari olmayan kullanım içindir; ticari kullanım Pro veya Enterprise plan gerektirir.

Bu proje her iki seçeneğe de hazırdır. Aşağıda **A seçeneği** ayrıntılı, B seçeneği özet olarak anlatılmıştır.

---

## 3. Kodu GitHub'a yükleme

1. <https://github.com> → *New repository* → ad: `mume-web` → **Private** seçin → *Create*.
2. Bilgisayarınızda proje klasöründe:

```bash
npm install
cp .env.example .env            # yerel değerleri doldurun
npx prisma migrate dev --name ilk-kurulum
git init
git add .
git commit -m "MuMê web sitesi ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/mume-web.git
git push -u origin main
```

`.env` dosyası `.gitignore` içinde olduğu için GitHub'a **gitmez**. Şifreleri asla depoya eklemeyin.

---

## 4A. VPS'e kurulum (Docker + otomatik HTTPS)

### 4A.1 Sunucuyu oluşturun
- Ubuntu 24.04, en az 2 GB RAM, Avrupa'da bir veri merkezi (Türkiye'ye yakın olması hız için iyi olur).
- Oluşturduktan sonra sunucunun **IPv4 adresini** not edin (ör. `203.0.113.10`).

### 4A.2 Sunucuya bağlanıp Docker kurun

```bash
ssh root@SUNUCU_IP
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

### 4A.3 Projeyi indirin ve ortam değişkenlerini girin

```bash
git clone https://github.com/KULLANICI_ADINIZ/mume-web.git /opt/mume
cd /opt/mume
cp .env.example .env
nano .env
```

`.env` içinde doldurulacaklar:

| Değişken | Değer |
|---|---|
| `SITE_URL` | `https://mume.com` |
| `POSTGRES_PASSWORD` | Uzun rastgele bir şifre (`openssl rand -base64 24`) |
| `AUTH_SECRET` | `openssl rand -base64 48` çıktısı |
| `ADMIN_EMAIL` | Panel giriş e-postanız |
| `ADMIN_PASSWORD` | En az 10 karakterlik güçlü bir ilk şifre (girişten sonra panelden değiştirin) |
| `STORAGE_DRIVER` | `local` |
| `PAYMENT_PROVIDER` | `none` |

### 4A.4 DNS'i sunucuya yönlendirin (bkz. Bölüm 5), sonra başlatın

```bash
docker compose up -d --build
docker compose exec app npm run db:seed     # ilk kurulumda bir kez: kategoriler, örnek içerik, yönetici
docker compose logs -f app                  # açılış kayıtlarını izlemek için (Ctrl+C ile çıkın)
```

Caddy, DNS kayıtları sunucuya ulaştığı anda Let's Encrypt sertifikasını **otomatik** alır; HTTPS ve
`www.mume.com → mume.com` yönlendirmesi `Caddyfile` içinde tanımlıdır.

### 4A.5 Güncelleme

```bash
cd /opt/mume && git pull && docker compose up -d --build
```

### 4A.6 Yedekleme (haftalık önerilir)

```bash
# Veritabanı
docker compose exec -T db pg_dump -U mume mume | gzip > /root/yedek-$(date +%F).sql.gz
# Yüklenen fotoğraflar
docker run --rm -v mume_uploads:/data -v /root:/yedek alpine tar czf /yedek/fotograflar-$(date +%F).tgz -C /data .
```

Yedekleri sunucu dışına (ör. bilgisayarınıza veya Google Drive'a) kopyalayın.

---

## 4B. (Alternatif) Vercel Pro ile kurulum — özet

1. Neon veya Supabase'te bir PostgreSQL veritabanı oluşturun; bağlantı adresini alın.
2. Cloudflare R2'de bir bucket açın, herkese açık erişim için `medya.mume.com` alt alan adını bağlayın, erişim anahtarı oluşturun.
3. <https://vercel.com> → *Add New Project* → GitHub'daki `mume-web` deposunu seçin.
4. *Environment Variables*: `SITE_URL`, `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `STORAGE_DRIVER=s3`, `S3_ENDPOINT`, `S3_REGION=auto`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
   `MEDIA_PUBLIC_BASE_URL=https://medya.mume.com`, `MEDIA_PUBLIC_HOSTNAME=medya.mume.com`, `PAYMENT_PROVIDER=none`.
   (Vercel'de sunucu diski kalıcı değildir; bu yüzden `local` yerine `s3` zorunludur.)
5. *Build Command*: `npx prisma migrate deploy && npm run build`.
6. Deploy edin; ardından bilgisayarınızda `.env`'e aynı `DATABASE_URL`'yi yazıp `npm run db:seed` çalıştırın.
7. *Settings → Domains* bölümüne `mume.com` ve `www.mume.com` ekleyin. Vercel'in o ekranda gösterdiği DNS değerlerini
   Bölüm 5'teki gibi girin ve `www`'yi `mume.com`'a yönlendirecek şekilde ayarlayın. HTTPS otomatik etkinleşir.

---

## 5. DNS kayıtları (e-postayı bozmadan)

### 5.1 Önce mevcut kayıtları kaydedin
Squarespace (veya hangi sağlayıcıysa) DNS ekranının tamamının ekran görüntüsünü alın. Google Workspace için tipik kayıtlar:

| Tür | Ad | Değer (örnek) | Dokunulacak mı? |
|---|---|---|---|
| MX | @ | `smtp.google.com` (veya `ASPMX.L.GOOGLE.COM` ve diğerleri) | ❌ Hayır |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | ❌ Hayır |
| TXT | google._domainkey | `v=DKIM1; k=rsa; p=…` | ❌ Hayır |
| TXT | _dmarc | `v=DMARC1; p=…` | ❌ Hayır |
| TXT | @ | `google-site-verification=…` | ❌ Hayır |
| CNAME | mail / calendar vb. | `ghs.googlehosted.com` | ❌ Hayır |

### 5.2 Yalnızca web kayıtlarını ekleyin/değiştirin (VPS seçeneği)

| Tür | Ad | Değer | TTL |
|---|---|---|---|
| A | `@` | `SUNUCU_IPV4` | 1 saat (veya varsayılan) |
| A | `www` | `SUNUCU_IPV4` | 1 saat |
| AAAA | `@` ve `www` | Sunucunun IPv6 adresi (varsa) | 1 saat |

- `@` veya `www` için **eski bir A/AAAA/CNAME kaydı** (ör. Squarespace park sayfası, Google Sites) varsa **yalnızca onları** silip yenilerini ekleyin.
- Squarespace bazı alan adlarında “varsayılan kayıtlar” (Squarespace Defaults) grubu gösterir; web sitesine ait olan bu grubu kaldırmanız
  gerekebilir. **Google Workspace kayıt grubunu silmeyin.**
- Yayılma genelde birkaç dakika–birkaç saat sürer. Kontrol: <https://dnschecker.org/#A/mume.com>

### 5.3 E-postanın hâlâ çalıştığını doğrulayın
- Başka bir adresten `@mume.com` adresinize e-posta gönderin ve gelen kutusunu kontrol edin.
- Google Yönetici Konsolu → *Uygulamalar* → *Gmail* → *E-postanın kimliğini doğrula* bölümünde DKIM'in “Kimlik doğrulanıyor” olduğunu görün.
- MX kontrolü: <https://dnschecker.org/#MX/mume.com>

### 5.4 (İsteğe bağlı) Cloudflare'e taşımak
DNS'i Cloudflare'e taşırsanız, Cloudflare'in içe aktardığı kayıtlarda **MX ve TXT kayıtlarının eksiksiz** olduğunu ad sunucularını
değiştirmeden önce kontrol edin. A kayıtlarını “Proxied” (turuncu bulut) yapabilirsiniz; SSL/TLS modunu **Full (strict)** seçin.
Bu adım zorunlu değildir.

---

## 6. HTTPS ve www yönlendirmesi
- **VPS:** Caddy, `mume.com` ve `www.mume.com` için sertifikayı otomatik alır ve yeniler; `www` kalıcı (301) olarak `https://mume.com`'a yönlenir.
- **Vercel:** Domains ekranında `www.mume.com` → `mume.com` yönlendirmesini seçin; sertifika otomatik.
- Kontrol: `curl -I http://www.mume.com` → `301` ve `location: https://mume.com/` görmelisiniz.

---

## 7. Yayından sonra
1. `https://mume.com/yonetim` → giriş yapın → **Hesap** bölümünden şifrenizi değiştirin.
2. **Site İçeriği** → WhatsApp numarası, telefon, e-posta, çalışma saatleri.
3. Örnek ürün ve workshopları gerçek içerikle güncelleyin; workshop tarihlerini ekleyip “Yayında” işaretleyin.
4. Kendi telefonunuzdan bir test siparişi ve bir test rezervasyonu yapın; WhatsApp mesajının doğru numaraya geldiğini görün,
   sonra bu kayıtları panelden “İptal” olarak işaretleyin.
5. Google Search Console'a `mume.com` alanını ekleyin ve `https://mume.com/sitemap.xml` gönderin.
6. Google İşletme Profili'nize web sitesi adresi olarak `https://mume.com` yazın; Instagram biyografisine de ekleyin.

## 8. Online ödeme (ileride)
iyzico veya PayTR ile sözleşme yaptıktan sonra `src/lib/payments/README.md` dosyasındaki adımları izleyin.
Anahtarlar yalnızca sunucudaki `.env` dosyasına yazılır; önce sandbox (test) anahtarlarıyla deneyin.

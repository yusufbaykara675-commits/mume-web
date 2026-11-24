# Online ödeme entegrasyonu (ileride)

Şu an siparişler WhatsApp ile tamamlanıyor; ödeme alınmıyor ve hiçbir ödeme anahtarı istenmiyor.

## Etkinleştirmek için

1. iyzico veya PayTR ile üye iş yeri sözleşmesi yapın. Size **test (sandbox)** ve **canlı** anahtarlar verilir.
2. `src/lib/payments/index.ts` içindeki `NotImplementedProvider` yerine seçtiğiniz sağlayıcının sınıfını yazın:
   - `initialize()` → sağlayıcının resmi API'si ile ödeme formu/iframe başlatılır.
   - `verifyCallback()` → sağlayıcının gönderdiği bildirimdeki imza/hash, gizli anahtarla **sunucuda** doğrulanır.
3. `src/app/api/odeme/bildirim/[provider]/route.ts` dosyası bu doğrulamayı çağırır ve yalnızca doğrulama başarılıysa siparişi `ODENDI` yapar.
4. Önce sandbox anahtarlarla test edin; canlıya geçince `.env` içinde `PAYMENT_PROVIDER` değerini ayarlayın.

## Güvenlik kuralları

- Ödeme başarılı sayfası **asla** tek başına "ödendi" anlamına gelmez; yalnızca doğrulanmış bildirim sayılır.
- Tutar her zaman sunucuda, veritabanındaki fiyatlardan yeniden hesaplanır.
- Kart bilgisi bu siteye hiç gelmez; sağlayıcının güvenli formunda girilir.
- Gizli anahtarlar yalnızca sunucu ortam değişkenlerinde tutulur.

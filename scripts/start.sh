#!/bin/sh
# Sunucu başlarken veritabanı şemasını günceller, ardından siteyi başlatır.
set -e

if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "▶ Veritabanı geçişleri uygulanıyor (prisma migrate deploy)…"
  npx prisma migrate deploy
else
  echo "▶ Geçiş klasörü yok — şema doğrudan eşitleniyor (prisma db push)…"
  npx prisma db push --skip-generate
fi

echo "▶ Site başlatılıyor…"
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0

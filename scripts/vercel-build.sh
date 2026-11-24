#!/bin/sh
# Vercel derlemesi: veritabanı bağlıysa şemayı eşitler ve ilk verileri (yönetici, kategoriler,
# örnek içerik — yalnızca eksikse) oluşturur; ardından siteyi derler.
set -e
npx prisma generate

if [ -n "$DATABASE_URL" ]; then
  export DATABASE_URL_UNPOOLED="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
  echo "▶ Veritabanı şeması eşitleniyor…"
  npx prisma db push --skip-generate
  echo "▶ İlk veriler kontrol ediliyor…"
  npx tsx prisma/seed.ts
else
  echo "▶ DATABASE_URL yok — site önizleme modunda derleniyor."
fi

npx next build

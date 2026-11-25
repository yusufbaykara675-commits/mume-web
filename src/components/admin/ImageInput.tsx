"use client";

import { useState } from "react";

/**
 * Fotoğrafları göndermeden önce tarayıcıda küçültür (en fazla 2000 px, JPEG).
 * Vercel tek istekte 4,5 MB'tan büyük gövdeye izin vermediği için telefon
 * fotoğraflarının sorunsuz yüklenmesini sağlar.
 */
const MAX_SIDE = 2000;
const MAX_TOTAL = 4 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    for (const q of [0.86, 0.78, 0.7]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
      if (blob && (blob.size < 1.5 * 1024 * 1024 || q === 0.7)) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
  } catch {
    // Tarayıcı bu biçimi açamıyorsa (ör. bazı HEIC) orijinal dosya gönderilir
  }
  return file;
}

export function ImageInput({
  name,
  multiple = false,
  required = false,
  className = "",
}: {
  name: string;
  multiple?: boolean;
  required?: boolean;
  className?: string;
}) {
  const [status, setStatus] = useState<string>("");

  return (
    <div>
      <input
        type="file"
        name={name}
        accept="image/*"
        multiple={multiple}
        required={required}
        className={className}
        onChange={async (e) => {
          const input = e.currentTarget as HTMLInputElement;
          const list: File[] = Array.from(input.files ?? []);
          if (!list.length) return setStatus("");
          setStatus("Fotoğraflar hazırlanıyor…");
          const out = await Promise.all(list.map(shrink));
          const total = out.reduce((s, f) => s + f.size, 0);
          const dt = new DataTransfer();
          out.forEach((f) => dt.items.add(f));
          input.files = dt.files;
          setStatus(
            total > MAX_TOTAL
              ? "Seçilen fotoğraflar birlikte çok büyük. Lütfen daha az fotoğraf seçip birkaç seferde yükleyin."
              : `${out.length} fotoğraf hazır (${(total / 1024 / 1024).toFixed(1)} MB).`,
          );
        }}
      />
      {status && <p className="mt-1 text-xs text-ink/60">{status}</p>}
    </div>
  );
}

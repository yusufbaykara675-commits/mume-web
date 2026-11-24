import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { put as blobPut, del as blobDel } from "@vercel/blob";

/**
 * Görsel yükleme katmanı.
 *  - STORAGE_DRIVER=local → dosyalar sunucu diskinde (UPLOAD_DIR) tutulur ve /media/... adresinden sunulur.
 *  - STORAGE_DRIVER=s3    → Cloudflare R2, AWS S3 veya Supabase Storage (S3 uyumlu) kullanılır.
 * Yüklenen her görsel en fazla 2000 px'e küçültülür ve WebP'ye dönüştürülür.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);

export class UploadError extends Error {
  name = "UploadError";
}

function driver() {
  const explicit = (process.env.STORAGE_DRIVER || "").toLowerCase();
  if (explicit) return explicit;
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

function uploadDir() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

let s3: S3Client | null = null;
function s3Client() {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
  }
  return s3;
}

export async function saveImage(file: File, folder = "genel"): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("Dosya seçilmedi.");
  if (file.size > MAX_BYTES) throw new UploadError("Görsel en fazla 8 MB olabilir.");
  if (!ALLOWED.has(file.type)) throw new UploadError("Yalnızca JPG, PNG, WebP, AVIF veya HEIC görseller yüklenebilir.");

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input)
      .rotate() // telefon fotoğraflarının yönünü düzeltir
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadError("Görsel işlenemedi. Lütfen farklı bir dosya deneyin.");
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "genel";
  const key = `${safeFolder}/${new Date().getFullYear()}/${randomUUID()}.webp`;

  if (driver() === "blob") {
    const res = await blobPut(key, output, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return res.url;
  }

  if (driver() === "s3") {
    await s3Client().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: output,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const base = (process.env.MEDIA_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    return `${base}/${key}`;
  }

  const target = path.join(uploadDir(), key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output);
  return `/media/${key}`;
}

/** Yalnızca bu sistemin yüklediği dosyaları siler; örnek/yer tutucu görsellere dokunmaz. */
export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/media/")) {
      const rel = url.slice("/media/".length);
      const target = path.resolve(uploadDir(), rel);
      if (!target.startsWith(uploadDir() + path.sep)) return;
      await unlink(target);
      return;
    }
    if (driver() === "blob" && url.includes(".blob.vercel-storage.com/")) {
      await blobDel(url);
      return;
    }
    const base = (process.env.MEDIA_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    if (driver() === "s3" && base && url.startsWith(base + "/")) {
      await s3Client().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: url.slice(base.length + 1) }));
    }
  } catch (err) {
    console.warn("Görsel silinemedi", url, err);
  }
}

export function resolveUploadPath(parts: string[]): string | null {
  const target = path.resolve(uploadDir(), ...parts);
  if (!target.startsWith(uploadDir() + path.sep)) return null;
  return target;
}

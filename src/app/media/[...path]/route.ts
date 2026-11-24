import { readFile, stat } from "fs/promises";
import { resolveUploadPath } from "@/lib/storage";

// Yönetim panelinden yüklenen görselleri (STORAGE_DRIVER=local) sunar.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!path?.length || path.some((p) => p.includes("..") || p.startsWith("."))) {
    return new Response("Bulunamadı", { status: 404 });
  }
  const file = resolveUploadPath(path);
  if (!file || !file.endsWith(".webp")) return new Response("Bulunamadı", { status: 404 });
  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Bulunamadı", { status: 404 });
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}

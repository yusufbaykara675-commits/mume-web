// Edge (middleware) ve Node ortamlarında ortak kullanılan oturum ayarları.
export const SESSION_COOKIE = "mume_admin";

export function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil veya 32 karakterden kısa. .env dosyasını kontrol edin.");
  }
  return new TextEncoder().encode(secret);
}

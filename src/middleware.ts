import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, getSecretKey } from "@/lib/session-config";

// İlk savunma hattı: oturumu olmayan ziyaretçiyi giriş sayfasına yönlendirir.
// Asıl yetki kontrolü her sayfada ve sunucu işleminde requireAdmin() ile tekrar yapılır.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/yonetim/giris") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch {
      // geçersiz/süresi dolmuş oturum
    }
  }
  const url = req.nextUrl.clone();
  url.pathname = "/yonetim/giris";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/yonetim/:path*"],
};

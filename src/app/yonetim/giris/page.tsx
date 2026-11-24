import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/demo";
import { login } from "@/actions/admin/auth";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";

export const metadata: Metadata = { title: "Yönetici Girişi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/yonetim");
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-3xl bg-ivory p-8 shadow-[var(--shadow-lift)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo-small.jpg" alt="MuMê" width={72} height={94} className="rounded-xl" />
          <h1 className="mt-4 text-3xl">Yönetim Paneli</h1>
          <p className="text-sm text-ink/60">Devam etmek için giriş yapın</p>
        </div>
        {!hasDatabase && (
          <p className="mb-5 rounded-xl bg-flame/40 px-4 py-3 text-sm text-brown">
            Site önizleme modunda. Yönetim paneli, Vercel projesine bir PostgreSQL veritabanı bağlandığında açılır.
          </p>
        )}
        <AdminForm action={login}>
          <label className="block">
            <span className="label">E-posta</span>
            <input name="email" type="email" autoComplete="username" required className="input" />
          </label>
          <label className="block">
            <span className="label">Şifre</span>
            <input name="password" type="password" autoComplete="current-password" required className="input" />
          </label>
          <SubmitButton className="w-full">Giriş yap</SubmitButton>
        </AdminForm>
      </div>
    </div>
  );
}

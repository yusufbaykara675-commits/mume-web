import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-8xl italic text-terracotta">404</p>
      <h1 className="mt-4 text-4xl">Aradığınız sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-ink/70">Sayfa taşınmış ya da kaldırılmış olabilir. Koleksiyonumuza göz atabilirsiniz.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Ana Sayfa</Link>
        <Link href="/urunler" className="btn-outline">Koleksiyon</Link>
      </div>
    </div>
  );
}

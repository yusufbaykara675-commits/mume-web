"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl">Bir aksilik oldu</h1>
      <p className="mt-3 max-w-md text-ink/70">Sayfa şu an yüklenemedi. Lütfen biraz sonra tekrar deneyin.</p>
      <button onClick={reset} className="btn-primary mt-8">
        Tekrar dene
      </button>
    </div>
  );
}

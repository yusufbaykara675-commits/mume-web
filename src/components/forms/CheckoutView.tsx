"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityInput } from "@/components/cart/QuantityInput";
import { Field, FormAlert, Honeypot, KvkkCheckbox, Spinner } from "./FormBits";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";
import { createOrder } from "@/actions/public";
import { formatPrice } from "@/lib/format";
import { t } from "@/i18n";

export function CheckoutView({
  hasWhatsapp,
  previewMode = false,
  instagramUrl,
}: {
  hasWhatsapp: boolean;
  previewMode?: boolean;
  instagramUrl?: string;
}) {
  const cart = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; whatsappUrl: string | null } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "KARGO",
      kvkkConsent: false,
      marketingConsent: false,
      startedAt: Date.now(),
      website: "",
    },
  });
  const delivery = watch("deliveryMethod");

  const onSubmit = async (values: CheckoutInput) => {
    setServerError(null);
    const res = await createOrder(
      cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, color: l.color, fragrance: l.fragrance })),
      values,
    );
    if (!res.ok) {
      setServerError(res.error);
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0]) setError(k as keyof CheckoutInput, { message: v[0] });
        }
      }
      return;
    }
    setDone(res.data);
    cart.clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center md:p-12">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-2xl text-olive">✓</div>
        <h2 className="text-3xl">Siparişiniz oluşturuldu</h2>
        <p className="mt-3 text-ink/75">
          Sipariş numaranız: <strong className="tracking-wider text-espresso">{done.code}</strong>
        </p>
        {done.whatsappUrl ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Son adım: Sipariş özetiniz hazır. Aşağıdaki butona dokunarak WhatsApp üzerinden bize gönderin; kargo ve ödeme bilgisini oradan iletelim.
            </p>
            <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6 w-full text-base">
              WhatsApp ile Siparişi Gönder
            </a>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink/70">Talebiniz bize ulaştı. En kısa sürede verdiğiniz telefon numarasından sizinle iletişime geçeceğiz.</p>
        )}
        <p className="mt-5 text-xs text-ink/50">Ödeme bu aşamada alınmamıştır. Siparişiniz, sizinle teyitleştikten sonra hazırlanır.</p>
        <Link href="/urunler" className="btn-outline mt-6">
          Alışverişe devam et
        </Link>
      </div>
    );
  }

  if (!cart.ready) {
    return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-sand/60" />;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="font-serif text-2xl">{t.cart.empty}</p>
        <Link href="/urunler" className="btn-primary mt-6">
          {t.cta.explore}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section className="lg:col-span-5" aria-labelledby="sepet-urunler">
        <h2 id="sepet-urunler" className="mb-4 text-2xl">
          Ürünler
        </h2>
        <ul className="card divide-y divide-sand px-5">
          {cart.lines.map((l) => (
            <li key={l.key} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 flex-none overflow-hidden rounded-xl bg-sand">
                {l.image && <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/urunler/${l.slug}`} className="font-serif text-lg leading-tight">
                  {l.name}
                </Link>
                <p className="text-xs text-ink/60">{[l.color, l.fragrance].filter(Boolean).join(" · ")}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QuantityInput small value={l.quantity} max={l.max} onChange={(q) => cart.setQuantity(l.key, q)} />
                  <span className="text-sm font-semibold">
                    {l.unitPriceCents === null ? "Fiyat sorulacak" : formatPrice(l.unitPriceCents * l.quantity)}
                  </span>
                </div>
                <button type="button" onClick={() => cart.remove(l.key)} className="mt-1 self-start text-xs text-ink/50 hover:underline">
                  {t.cart.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 px-1 text-sm">
          <div className="flex justify-between">
            <span>{t.cart.subtotal}</span>
            <span className="font-semibold">{formatPrice(cart.subtotalCents)}</span>
          </div>
          {cart.hasUnpriced && <p className="text-xs text-ink/60">{t.cart.unpriced}</p>}
          <p className="text-xs text-ink/60">{t.cart.shippingNote} Son tutar sipariş teyidinde netleşir.</p>
        </div>
      </section>

      <section className="lg:col-span-7" aria-labelledby="teslimat">
        <h2 id="teslimat" className="mb-4 text-2xl">
          Teslimat ve iletişim bilgileri
        </h2>
        {previewMode ? (
          <div className="card space-y-4 p-6 md:p-8">
            <FormAlert tone="error">
              Site şu an önizleme modunda; online sipariş henüz kaydedilmiyor. Sepetinizdeki ürünler için Instagram&apos;dan bize yazabilirsiniz.
            </FormAlert>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                Instagram&apos;dan Sipariş Ver
              </a>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card relative space-y-5 p-6 md:p-8">
          <Honeypot register={register("website")} />
          <input type="hidden" {...register("startedAt", { valueAsNumber: true })} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ad Soyad *" htmlFor="customerName" error={errors.customerName}>
              <input id="customerName" autoComplete="name" className="input" {...register("customerName")} aria-invalid={!!errors.customerName} />
            </Field>
            <Field label="Telefon (WhatsApp) *" htmlFor="phone" error={errors.phone}>
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" className="input" {...register("phone")} aria-invalid={!!errors.phone} />
            </Field>
          </div>
          <Field label="E-posta (isteğe bağlı)" htmlFor="email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" className="input" {...register("email")} />
          </Field>

          <fieldset>
            <legend className="label">Teslimat şekli *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { v: "KARGO", l: "Kargo ile gönderim", d: "Türkiye'nin her yerine" },
                { v: "ATOLYEDEN_TESLIM", l: "Atölyeden teslim al", d: "Van, Şerefiye Mah." },
              ].map((o) => (
                <label key={o.v} className="cursor-pointer">
                  <input type="radio" value={o.v} className="peer sr-only" {...register("deliveryMethod")} />
                  <span className="block rounded-xl border border-beige p-4 transition peer-checked:border-espresso peer-checked:bg-cream peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta">
                    <span className="block text-sm font-semibold">{o.l}</span>
                    <span className="block text-xs text-ink/60">{o.d}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {delivery === "KARGO" && (
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Şehir *" htmlFor="city" error={errors.city}>
                <input id="city" autoComplete="address-level1" className="input" {...register("city")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Açık adres *" htmlFor="address" error={errors.address}>
                  <textarea id="address" rows={2} autoComplete="street-address" className="input" {...register("address")} />
                </Field>
              </div>
            </div>
          )}

          <Field label="Sipariş notu" htmlFor="note" error={errors.note} hint="Kişiye özel isim/tarih, hediye notu veya teslim tarihi isteğinizi yazabilirsiniz.">
            <textarea id="note" rows={3} className="input" {...register("note")} />
          </Field>

          <div className="space-y-3 rounded-xl bg-cream/60 p-4">
            <KvkkCheckbox register={register("kvkkConsent")} error={errors.kvkkConsent} purpose="siparişimin alınması ve teslimatı" />
            <label className="flex items-start gap-3 text-sm text-ink/70">
              <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-terracotta" {...register("marketingConsent")} />
              <span>Yeni ürün ve workshop duyurularının bana iletilmesine izin veriyorum. (İsteğe bağlı)</span>
            </label>
          </div>

          {serverError && <FormAlert tone="error">{serverError}</FormAlert>}

          <button type="submit" disabled={isSubmitting} className="btn-whatsapp w-full text-base">
            {isSubmitting ? (
              <>
                <Spinner /> Gönderiliyor…
              </>
            ) : hasWhatsapp ? (
              "Siparişi Oluştur ve WhatsApp'a Geç"
            ) : (
              "Sipariş Talebini Gönder"
            )}
          </button>
          <p className="text-center text-xs text-ink/55">Bu adımda ödeme alınmaz. Sipariş, WhatsApp üzerinden teyit edildikten sonra hazırlanır.</p>
        </form>
        )}
      </section>
    </div>
  );
}

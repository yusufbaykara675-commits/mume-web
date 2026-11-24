"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationInput } from "@/lib/validators";
import { createReservation } from "@/actions/public";
import { formatPrice } from "@/lib/format";
import { Field, FormAlert, Honeypot, KvkkCheckbox, Spinner } from "./FormBits";

type SessionOption = { id: string; startsAt: string; seatsLeft: number; note: string | null };

const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "long" }).format(new Date(iso));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export function ReservationForm({ sessions, priceCents }: { sessions: SessionOption[]; priceCents: number | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const firstOpen = sessions.find((s) => s.seatsLeft > 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { sessionId: firstOpen?.id ?? "", participants: 1, kvkkConsent: false, startedAt: Date.now(), website: "" },
  });

  const sessionId = watch("sessionId");
  const participants = watch("participants") || 1;
  const selected = sessions.find((s) => s.id === sessionId);
  const maxSeats = Math.max(1, Math.min(selected?.seatsLeft ?? 1, 20));

  const onSubmit = async (values: ReservationInput) => {
    setServerError(null);
    const res = await createReservation(values);
    if (!res.ok) {
      setServerError(res.error);
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) if (v?.[0]) setError(k as keyof ReservationInput, { message: v[0] });
      }
      router.refresh(); // kalan yer bilgisini güncelle
      return;
    }
    router.push(`/rezervasyon/${res.data.code}`);
  };

  if (!firstOpen) {
    return <p className="mt-4 text-ink/70">Tüm tarihler doldu. Yeni tarihler için bizi takip edin veya bize yazın.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative mt-6 space-y-5">
      <Honeypot register={register("website")} />
      <input type="hidden" {...register("startedAt", { valueAsNumber: true })} />

      <fieldset>
        <legend className="label">Tarih seçin *</legend>
        <div className="grid gap-2">
          {sessions.map((s) => {
            const full = s.seatsLeft <= 0;
            return (
              <label key={s.id} className={full ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                <input
                  type="radio"
                  value={s.id}
                  disabled={full}
                  className="peer sr-only"
                  {...register("sessionId", {
                    onChange: () => setValue("participants", 1),
                  })}
                />
                <span className="flex items-center justify-between rounded-xl border border-beige bg-white px-4 py-3 transition peer-checked:border-espresso peer-checked:bg-cream peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta">
                  <span>
                    <span className="block text-sm font-semibold capitalize">{fmtDay(s.startsAt)}</span>
                    <span className="block text-xs text-ink/60">
                      Saat {fmtTime(s.startsAt)}
                      {s.note ? ` · ${s.note}` : ""}
                    </span>
                  </span>
                  <span className={`text-xs font-semibold ${full ? "text-terracotta" : s.seatsLeft <= 3 ? "text-terracotta" : "text-sage"}`}>
                    {full ? "Dolu" : `${s.seatsLeft} yer`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.sessionId && <p className="field-error">{errors.sessionId.message}</p>}
      </fieldset>

      <Field label="Kişi sayısı *" htmlFor="participants" error={errors.participants}>
        <select id="participants" className="input" {...register("participants", { valueAsNumber: true })}>
          {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} kişi
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ad Soyad *" htmlFor="fullName" error={errors.fullName}>
        <input id="fullName" autoComplete="name" className="input" {...register("fullName")} />
      </Field>
      <Field label="Telefon (WhatsApp) *" htmlFor="r-phone" error={errors.phone}>
        <input id="r-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" className="input" {...register("phone")} />
      </Field>
      <Field label="E-posta (isteğe bağlı)" htmlFor="r-email" error={errors.email}>
        <input id="r-email" type="email" autoComplete="email" className="input" {...register("email")} />
      </Field>
      <Field label="Not" htmlFor="r-note" error={errors.note} hint="Doğum günü kutlaması, grup organizasyonu vb. belirtebilirsiniz.">
        <textarea id="r-note" rows={2} className="input" {...register("note")} />
      </Field>

      {priceCents !== null && (
        <div className="flex justify-between rounded-xl bg-cream px-4 py-3 text-sm">
          <span>Tahmini toplam ({participants} kişi)</span>
          <span className="font-semibold">{formatPrice(priceCents * participants)}</span>
        </div>
      )}

      <KvkkCheckbox register={register("kvkkConsent")} error={errors.kvkkConsent} purpose="workshop rezervasyonumun alınması ve benimle iletişime geçilmesi" />

      {serverError && <FormAlert tone="error">{serverError}</FormAlert>}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base">
        {isSubmitting ? (
          <>
            <Spinner /> Gönderiliyor…
          </>
        ) : (
          "Rezervasyon Talebi Gönder"
        )}
      </button>
      <p className="text-center text-xs text-ink/55">Bu bir rezervasyon talebidir. Onay sonrası bilgilendirileceksiniz; şu an ödeme alınmaz.</p>
    </form>
  );
}

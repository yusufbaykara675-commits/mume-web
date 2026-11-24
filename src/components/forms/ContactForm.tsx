"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { sendContactMessage } from "@/actions/public";
import { Field, FormAlert, Honeypot, KvkkCheckbox, Spinner } from "./FormBits";

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { kvkkConsent: false, startedAt: Date.now(), website: "" },
  });

  const onSubmit = async (values: ContactInput) => {
    setServerError(null);
    const res = await sendContactMessage(values);
    if (!res.ok) {
      setServerError(res.error);
      if (res.fieldErrors) for (const [k, v] of Object.entries(res.fieldErrors)) if (v?.[0]) setError(k as keyof ContactInput, { message: v[0] });
      return;
    }
    setSent(true);
    reset({ kvkkConsent: false, startedAt: Date.now(), website: "" });
  };

  if (sent) {
    return (
      <div className="mt-6">
        <FormAlert tone="success">Mesajınız bize ulaştı. En kısa sürede size dönüş yapacağız. Teşekkür ederiz!</FormAlert>
        <button className="btn-outline mt-4" onClick={() => setSent(false)}>
          Yeni mesaj yaz
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative mt-6 space-y-5">
      <Honeypot register={register("website")} />
      <input type="hidden" {...register("startedAt", { valueAsNumber: true })} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ad Soyad *" htmlFor="c-name" error={errors.name}>
          <input id="c-name" autoComplete="name" className="input" {...register("name")} />
        </Field>
        <Field label="Telefon" htmlFor="c-phone" error={errors.phone}>
          <input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" className="input" {...register("phone")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="E-posta" htmlFor="c-email" error={errors.email}>
          <input id="c-email" type="email" autoComplete="email" className="input" {...register("email")} />
        </Field>
        <Field label="Konu" htmlFor="c-subject" error={errors.subject}>
          <input id="c-subject" className="input" placeholder="Kişiye özel sipariş, workshop…" {...register("subject")} />
        </Field>
      </div>
      <Field label="Mesajınız *" htmlFor="c-message" error={errors.message}>
        <textarea id="c-message" rows={5} className="input" {...register("message")} />
      </Field>
      <KvkkCheckbox register={register("kvkkConsent")} error={errors.kvkkConsent} purpose="mesajıma yanıt verilmesi" />
      {serverError && <FormAlert tone="error">{serverError}</FormAlert>}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Spinner /> Gönderiliyor…
          </>
        ) : (
          "Mesajı Gönder"
        )}
      </button>
    </form>
  );
}

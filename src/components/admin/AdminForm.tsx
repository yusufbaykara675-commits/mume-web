"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/form-data";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/**
 * Yönetim formları için ortak sarmalayıcı: gönderim sırasında butonu kilitler,
 * başarı/hata mesajını Türkçe olarak gösterir.
 */
export function AdminForm({
  action,
  children,
  className = "space-y-5",
  resetOnSuccess = false,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-[#8a3d14]">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-xl bg-sage/15 px-4 py-3 text-sm text-olive">
          ✓ {state.ok}
        </p>
      )}
    </form>
  );
}

export function SubmitButton({ children, variant = "primary", className = "" }: { children: React.ReactNode; variant?: "primary" | "danger" | "outline"; className?: string }) {
  const { pending } = useFormStatus();
  const styles =
    variant === "danger"
      ? "btn bg-[#a23b13] px-5 py-2.5 text-white hover:bg-[#862f0e]"
      : variant === "outline"
        ? "btn-outline px-5! py-2.5!"
        : "btn-primary px-5! py-2.5!";
  return (
    <button type="submit" disabled={pending} className={`${styles} ${className}`}>
      {pending ? "İşleniyor…" : children}
    </button>
  );
}

/** Silme gibi geri alınamayan işlemlerden önce onay ister. */
export function ConfirmSubmit({ message, children, className = "" }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`text-sm font-medium text-[#a23b13] hover:underline disabled:opacity-50 ${className}`}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}

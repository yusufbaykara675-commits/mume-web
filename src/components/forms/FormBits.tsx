"use client";

import Link from "next/link";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: FieldError | { message?: string };
  hint?: string;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && !error?.message && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
      {error?.message && (
        <p id={`${htmlFor}-hata`} className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

/** Bal küpü alanı: insanlar görmez, botlar doldurur. */
export function Honeypot({ register }: { register: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Web siteniz
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  );
}

export function KvkkCheckbox({ register, error, purpose }: { register: UseFormRegisterReturn; error?: FieldError; purpose: string }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
        <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-terracotta" {...register} />
        <span>
          Kişisel verilerimin {purpose} amacıyla işlenmesine ilişkin{" "}
          <Link href="/kvkk" target="_blank" className="font-medium text-terracotta underline underline-offset-2">
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni okudum ve anladım.
        </span>
      </label>
      {error?.message && (
        <p className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm ${tone === "error" ? "bg-terracotta/10 text-[#8a3d14]" : "bg-sage/15 text-olive"}`}
    >
      {children}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />;
}

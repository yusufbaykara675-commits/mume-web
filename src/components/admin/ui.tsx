import Link from "next/link";

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-ink/65">{text}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary px-5! py-2.5!">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5 md:p-7 ${className}`}>
      {title && <h2 className="mb-5 font-sans text-base font-bold text-espresso">{title}</h2>}
      {children}
    </section>
  );
}

const tones: Record<string, string> = {
  green: "bg-sage/20 text-olive",
  amber: "bg-flame/50 text-brown",
  red: "bg-terracotta/15 text-[#8a3d14]",
  gray: "bg-sand text-ink/70",
  dark: "bg-espresso text-cream",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function orderTone(status: string): keyof typeof tones {
  return status === "YENI" ? "amber" : status === "IPTAL" ? "red" : status === "TAMAMLANDI" ? "dark" : "green";
}
export function reservationTone(status: string): keyof typeof tones {
  return status === "BEKLIYOR" ? "amber" : status === "ONAYLANDI" ? "green" : "red";
}

export function Input({ label, name, hint, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; hint?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <input name={name} className="input" {...rest} />
      {hint && <span className="mt-1 block text-xs text-ink/55">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, name, hint, rows = 4, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea name={name} rows={rows} className="input" {...rest} />
      {hint && <span className="mt-1 block text-xs text-ink/55">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-terracotta" />
      <span>
        <span className="text-sm font-medium text-espresso">{label}</span>
        {hint && <span className="block text-xs text-ink/55">{hint}</span>}
      </span>
    </label>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-beige px-4 py-10 text-center text-sm text-ink/60">{children}</p>;
}

export function Notice({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" }) {
  return (
    <p className={`mb-6 rounded-xl px-4 py-3 text-sm ${tone === "green" ? "bg-sage/15 text-olive" : "bg-flame/40 text-brown"}`}>{children}</p>
  );
}

import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-14 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-4xl leading-[1.05] md:text-5xl">{title}</h2>
        {text && <p className="mt-4 text-base leading-relaxed text-ink/75">{text}</p>}
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-2 text-sm font-semibold text-espresso">
          <span className="border-b border-espresso/30 pb-0.5 transition group-hover:border-terracotta group-hover:text-terracotta">{action.label}</span>
          <span aria-hidden className="transition group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

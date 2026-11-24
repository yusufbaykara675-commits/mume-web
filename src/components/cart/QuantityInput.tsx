"use client";

export function QuantityInput({
  value,
  max,
  onChange,
  small,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  small?: boolean;
}) {
  const size = small ? "h-8 w-8 text-sm" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-beige bg-white" role="group" aria-label="Adet">
      <button
        type="button"
        className={`${size} rounded-full text-espresso transition hover:bg-sand disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Azalt"
      >
        −
      </button>
      <span className={`min-w-8 text-center font-semibold ${small ? "text-sm" : ""}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${size} rounded-full text-espresso transition hover:bg-sand disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Artır"
      >
        +
      </button>
    </div>
  );
}

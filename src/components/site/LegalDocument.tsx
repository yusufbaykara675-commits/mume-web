import { Fragment } from "react";
import { parseLegal } from "@/lib/legal";

/** **kalın** ve [doldurulacak alan] parçalarını güvenli şekilde biçimlendirir. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}><Inline text={part.slice(2, -2)} /></strong>;
        if (part.startsWith("[") && part.endsWith("]"))
          return (
            <mark key={i} className="rounded bg-flame/15 px-1 text-ink">
              {part}
            </mark>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function LegalDocument({ text }: { text: string }) {
  return (
    <div className="prose-mume">
      {parseLegal(text).map((b, i) => {
        if (b.type === "h2") return <h2 key={i}><Inline text={b.text} /></h2>;
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j}><Inline text={item} /></li>
              ))}
            </ul>
          );
        return <p key={i}><Inline text={b.text} /></p>;
      })}
    </div>
  );
}

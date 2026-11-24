/** Yapılandırılmış veri (schema.org) çıktısı. "<" karakteri kaçırılarak XSS önlenir. */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

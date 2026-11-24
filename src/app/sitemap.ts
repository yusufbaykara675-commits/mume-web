import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { demoCategories, demoProducts, demoWorkshops, hasDatabase } from "@/lib/demo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  type Row = { slug: string; updatedAt: Date };
  const pick = (rows: Row[]): Row[] => rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
  let products: Row[] = pick(demoProducts);
  let workshops: Row[] = pick(demoWorkshops);
  let categories: Row[] = pick(demoCategories);
  if (hasDatabase) {
    [products, workshops, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.workshop.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
  }
  const staticPages = ["", "/urunler", "/workshoplar", "/hakkimizda", "/iletisim", "/kvkk", "/cerez-politikasi"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...staticPages,
    ...categories.map((c) => ({ url: `${SITE_URL}/urunler?kategori=${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE_URL}/urunler/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...workshops.map((w) => ({ url: `${SITE_URL}/workshoplar/${w.slug}`, lastModified: w.updatedAt, priority: 0.8 })),
  ];
}

import "server-only";
import type { Category, Prisma, Workshop, WorkshopSession } from "@prisma/client";
import { prisma } from "./db";
import { SEAT_HOLDING_STATUSES } from "./site";
export { stockInfo } from "./stock";
import { demoCategories, demoProducts, demoSearch, demoWorkshops, hasDatabase } from "./demo";

export const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export async function getCategories(): Promise<Category[]> {
  if (!hasDatabase) return demoCategories;
  return prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  if (!hasDatabase) return demoProducts.slice().sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, limit);
  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: productCardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  if (featured.length >= 4) return featured;
  return prisma.product.findMany({
    where: { isActive: true },
    include: productCardInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export type SortKey = "yeni" | "fiyat-artan" | "fiyat-azalan" | "isim";

export async function searchProducts(opts: { category?: string; q?: string; sort?: SortKey }): Promise<ProductCardData[]> {
  if (!hasDatabase) return demoSearch(opts);
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (opts.category) where.category = { slug: opts.category, isActive: true };
  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q, mode: "insensitive" } },
      { shortDescription: { contains: opts.q, mode: "insensitive" } },
      { description: { contains: opts.q, mode: "insensitive" } },
    ];
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    opts.sort === "fiyat-artan"
      ? [{ priceCents: { sort: "asc", nulls: "last" } }]
      : opts.sort === "fiyat-azalan"
        ? [{ priceCents: { sort: "desc", nulls: "last" } }]
        : opts.sort === "isim"
          ? [{ name: "asc" }]
          : [{ isFeatured: "desc" }, { createdAt: "desc" }];
  return prisma.product.findMany({ where, include: productCardInclude, orderBy, take: 120 });
}

/** Her oturum için dolu koltuk sayısı (onay bekleyen + onaylanan). */
export async function seatsTakenBySession(sessionIds: string[]): Promise<Map<string, number>> {
  if (!sessionIds.length || !hasDatabase) return new Map();
  const rows = await prisma.reservation.groupBy({
    by: ["sessionId"],
    where: { sessionId: { in: sessionIds }, status: { in: [...SEAT_HOLDING_STATUSES] } },
    _sum: { participants: true },
  });
  return new Map(rows.map((r) => [r.sessionId, r._sum.participants ?? 0]));
}

export type SessionWithSeats = WorkshopSession & { seatsLeft: number };
export type WorkshopWithSeats = Workshop & { sessions: SessionWithSeats[] };

export async function getUpcomingWorkshops(limit?: number): Promise<WorkshopWithSeats[]> {
  if (!hasDatabase) return demoWorkshops.slice(0, limit).map((w) => ({ ...w, sessions: [] }));
  const now = new Date();
  const workshops = await prisma.workshop.findMany({
    where: { isActive: true },
    include: {
      sessions: { where: { isActive: true, startsAt: { gt: now } }, orderBy: { startsAt: "asc" } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  const taken = await seatsTakenBySession(workshops.flatMap((w) => w.sessions.map((s) => s.id)));
  return workshops.map((w) => ({
    ...w,
    sessions: w.sessions.map((s) => ({ ...s, seatsLeft: Math.max(0, s.capacity - (taken.get(s.id) ?? 0)) })),
  }));
}


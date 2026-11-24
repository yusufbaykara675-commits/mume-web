// İstemci ve sunucuda ortak kullanılır.
export type StockInfo = { label: string; tone: "ok" | "low" | "out" | "made"; purchasable: boolean; max: number };

export function stockInfo(stock: number | null): StockInfo {
  if (stock === null) return { label: "Siparişe özel üretilir", tone: "made", purchasable: true, max: 20 };
  if (stock <= 0) return { label: "Tükendi", tone: "out", purchasable: false, max: 0 };
  if (stock <= 3) return { label: `Son ${stock} adet`, tone: "low", purchasable: true, max: stock };
  return { label: "Stokta", tone: "ok", purchasable: true, max: Math.min(stock, 20) };
}

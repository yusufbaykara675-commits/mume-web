import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Yeni ürün" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <PageHeader title="Yeni ürün" />
      <ProductForm categories={categories} />
    </div>
  );
}

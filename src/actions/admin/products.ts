"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/storage";
import { parsePriceToCents } from "@/lib/format";
import { slugify, splitList } from "@/lib/text";
import { bool, files, FormError, int, optStr, str, toErrorState, type ActionState } from "@/lib/form-data";

function priceOrThrow(raw: string, label: string) {
  try {
    return parsePriceToCents(raw);
  } catch {
    throw new FormError(`${label} geçersiz. Örnek: 450 veya 450,50`);
  }
}

export async function saveProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  let id = str(fd, "id", 40) || null;
  try {
    const name = str(fd, "name", 120);
    if (name.length < 2) throw new FormError("Ürün adı en az 2 karakter olmalı.");
    const slug = slugify(str(fd, "slug", 100) || name);
    if (!slug) throw new FormError("Geçerli bir adres (slug) oluşturulamadı.");
    const categoryId = optStr(fd, "categoryId", 40);
    const data = {
      name,
      slug,
      categoryId,
      shortDescription: optStr(fd, "shortDescription", 300),
      description: str(fd, "description", 8000),
      priceCents: priceOrThrow(str(fd, "price", 20), "Fiyat"),
      compareAtCents: priceOrThrow(str(fd, "compareAt", 20), "İndirim öncesi fiyat"),
      stock: int(fd, "stock", { min: 0, max: 100000 }),
      colors: splitList(str(fd, "colors", 500)).slice(0, 20),
      fragrances: splitList(str(fd, "fragrances", 500)).slice(0, 20),
      isActive: bool(fd, "isActive"),
      isFeatured: bool(fd, "isFeatured"),
      isSample: false, // panelden kaydedilen ürün artık örnek sayılmaz
    };

    const uploads = files(fd, "images").slice(0, 10);
    const urls: string[] = [];
    for (const f of uploads) urls.push(await saveImage(f, "urunler"));

    if (id) {
      const count = await prisma.productImage.count({ where: { productId: id } });
      await prisma.product.update({
        where: { id },
        data: { ...data, images: { create: urls.map((url, i) => ({ url, alt: name, sortOrder: count + i })) } },
      });
    } else {
      const created = await prisma.product.create({
        data: { ...data, images: { create: urls.map((url, i) => ({ url, alt: name, sortOrder: i })) } },
      });
      id = created.id;
    }
    revalidatePath("/", "layout");
  } catch (err) {
    return toErrorState(err);
  }
  redirect(`/yonetim/urunler/${id}?kaydedildi=1`);
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) redirect("/yonetim/urunler");
  await prisma.product.delete({ where: { id } });
  for (const img of product.images) await deleteImage(img.url);
  revalidatePath("/", "layout");
  redirect("/yonetim/urunler?silindi=1");
}

export async function deleteProductImage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "imageId", 40);
  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return;
  await prisma.productImage.delete({ where: { id } });
  await deleteImage(img.url);
  revalidatePath("/", "layout");
}

export async function moveProductImage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "imageId", 40);
  const dir = str(fd, "dir", 5) === "up" ? -1 : 1;
  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return;
  const list = await prisma.productImage.findMany({ where: { productId: img.productId }, orderBy: { sortOrder: "asc" } });
  const idx = list.findIndex((i) => i.id === id);
  const swap = list[idx + dir];
  if (!swap) return;
  const reordered = [...list];
  [reordered[idx], reordered[idx + dir]] = [reordered[idx + dir], reordered[idx]];
  await prisma.$transaction(reordered.map((im, i) => prisma.productImage.update({ where: { id: im.id }, data: { sortOrder: i } })));
  revalidatePath("/", "layout");
}

export async function updateImageAlt(fd: FormData) {
  await requireAdmin();
  await prisma.productImage.update({ where: { id: str(fd, "imageId", 40) }, data: { alt: str(fd, "alt", 200) } });
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------
// Kategoriler
// ------------------------------------------------------------------

export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = str(fd, "id", 40) || null;
    const name = str(fd, "name", 80);
    if (name.length < 2) throw new FormError("Kategori adı en az 2 karakter olmalı.");
    const data = {
      name,
      slug: slugify(str(fd, "slug", 80) || name),
      description: optStr(fd, "description", 400),
      sortOrder: int(fd, "sortOrder", { min: 0, max: 999 }) ?? 0,
      isActive: bool(fd, "isActive"),
    };
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
    revalidatePath("/", "layout");
    return { ok: id ? "Kategori güncellendi." : "Kategori eklendi." };
  } catch (err) {
    return toErrorState(err);
  }
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: str(fd, "id", 40) } });
  revalidatePath("/", "layout");
}

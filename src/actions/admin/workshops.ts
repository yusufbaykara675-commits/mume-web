"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/storage";
import { istanbulInputToDate, parsePriceToCents } from "@/lib/format";
import { slugify, splitList } from "@/lib/text";
import { SEAT_HOLDING_STATUSES } from "@/lib/site";
import { bool, files, FormError, int, optStr, str, toErrorState, type ActionState } from "@/lib/form-data";

export async function saveWorkshop(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  let id = str(fd, "id", 40) || null;
  try {
    const title = str(fd, "title", 140);
    if (title.length < 3) throw new FormError("Workshop adı en az 3 karakter olmalı.");
    let priceCents: number | null;
    try {
      priceCents = parsePriceToCents(str(fd, "price", 20));
    } catch {
      throw new FormError("Ücret geçersiz. Örnek: 750 veya 750,00");
    }
    const existing = id ? await prisma.workshop.findUnique({ where: { id } }) : null;

    const cover = files(fd, "cover")[0];
    let coverImageUrl = existing?.coverImageUrl ?? null;
    if (cover) {
      const url = await saveImage(cover, "workshoplar");
      await deleteImage(coverImageUrl);
      coverImageUrl = url;
    }
    const galleryUploads = files(fd, "gallery").slice(0, 10);
    const newGallery: string[] = [];
    for (const f of galleryUploads) newGallery.push(await saveImage(f, "workshoplar"));

    const data = {
      title,
      slug: slugify(str(fd, "slug", 100) || title),
      shortDescription: optStr(fd, "shortDescription", 300),
      description: str(fd, "description", 8000),
      durationMinutes: int(fd, "durationMinutes", { min: 15, max: 720 }) ?? 120,
      priceCents,
      includes: splitList(str(fd, "includes", 2000).replace(/\r/g, "")).slice(0, 15),
      coverImageUrl,
      gallery: [...(existing?.gallery ?? []), ...newGallery].slice(0, 20),
      isActive: bool(fd, "isActive"),
      sortOrder: int(fd, "sortOrder", { min: 0, max: 999 }) ?? 0,
      isSample: false,
    };
    if (id) await prisma.workshop.update({ where: { id }, data });
    else id = (await prisma.workshop.create({ data })).id;
    revalidatePath("/", "layout");
  } catch (err) {
    return toErrorState(err);
  }
  redirect(`/yonetim/workshoplar/${id}?kaydedildi=1`);
}

export async function removeWorkshopImage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const url = str(fd, "url", 500);
  const w = await prisma.workshop.findUnique({ where: { id } });
  if (!w) return;
  await prisma.workshop.update({ where: { id }, data: { gallery: w.gallery.filter((g) => g !== url) } });
  await deleteImage(url);
  revalidatePath("/", "layout");
}

export async function deleteWorkshop(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const count = await prisma.reservation.count({ where: { session: { workshopId: id } } });
  if (count > 0) {
    return { error: "Bu workshop'a ait rezervasyonlar olduğu için silinemez. Bunun yerine 'Yayında' işaretini kaldırarak gizleyebilirsiniz." };
  }
  const w = await prisma.workshop.delete({ where: { id } });
  await deleteImage(w.coverImageUrl);
  for (const g of w.gallery) await deleteImage(g);
  revalidatePath("/", "layout");
  redirect("/yonetim/workshoplar?silindi=1");
}

// ------------------------------------------------------------------
// Oturumlar (tarih + kapasite)
// ------------------------------------------------------------------

export async function saveSession(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = str(fd, "id", 40) || null;
    const workshopId = str(fd, "workshopId", 40);
    let startsAt: Date;
    try {
      startsAt = istanbulInputToDate(str(fd, "startsAt", 20));
    } catch {
      throw new FormError("Lütfen geçerli bir tarih ve saat seçin.");
    }
    const capacity = int(fd, "capacity", { min: 1, max: 200 });
    if (!capacity) throw new FormError("Kapasite girin.");
    const data = { startsAt, capacity, note: optStr(fd, "note", 200), isActive: bool(fd, "isActive") };

    if (id) {
      const agg = await prisma.reservation.aggregate({
        where: { sessionId: id, status: { in: [...SEAT_HOLDING_STATUSES] } },
        _sum: { participants: true },
      });
      const booked = agg._sum.participants ?? 0;
      if (capacity < booked) throw new FormError(`Bu oturumda ${booked} kişilik rezervasyon var; kapasite bundan düşük olamaz.`);
      await prisma.workshopSession.update({ where: { id }, data });
    } else {
      if (startsAt <= new Date()) throw new FormError("Geçmiş bir tarihe oturum eklenemez.");
      await prisma.workshopSession.create({ data: { ...data, workshopId } });
    }
    revalidatePath("/", "layout");
    return { ok: id ? "Oturum güncellendi." : "Yeni tarih eklendi." };
  } catch (err) {
    return toErrorState(err);
  }
}

export async function deleteSession(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const count = await prisma.reservation.count({ where: { sessionId: id } });
  if (count > 0) return { error: "Bu tarihe ait rezervasyonlar var; silmek yerine yayından kaldırın." };
  await prisma.workshopSession.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: "Oturum silindi." };
}

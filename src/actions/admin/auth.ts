"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasDatabase } from "@/lib/demo";
import { createSession, destroySession, hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/security";
import { str, type ActionState } from "@/lib/form-data";

// Zamanlama saldırılarına karşı: kullanıcı yoksa da bir karşılaştırma yapılır.
let dummyHash: string | null = null;
async function getDummyHash() {
  if (!dummyHash) dummyHash = await hashPassword("mume-olmayan-kullanici");
  return dummyHash;
}

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email", 120).toLowerCase();
  const password = str(fd, "password", 200);
  if (!hasDatabase) return { error: "Yönetim paneli için önce veritabanı bağlanmalı (DEPLOY.md)." };
  if (!email || !password) return { error: "E-posta ve şifre gerekli." };

  const ip = await getClientIp();
  const key = `login:${ip}`;
  if (!(await rateLimit(key, 8, 15 * 60))) {
    return { error: "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) return { error: "E-posta veya şifre hatalı." };

  await resetRateLimit(key);
  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/yonetim");
}

export async function logout() {
  await destroySession();
  redirect("/yonetim/giris");
}

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const current = str(fd, "current", 200);
  const next = str(fd, "next", 200);
  const confirm = str(fd, "confirm", 200);
  if (next.length < 10) return { error: "Yeni şifre en az 10 karakter olmalı." };
  if (next !== confirm) return { error: "Yeni şifreler birbiriyle eşleşmiyor." };
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) return { error: "Mevcut şifre hatalı." };
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Şifreniz güncellendi." };
}

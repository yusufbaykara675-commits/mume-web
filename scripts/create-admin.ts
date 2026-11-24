/**
 * Yeni yönetici oluşturur veya mevcut yöneticinin şifresini sıfırlar.
 * Kullanım: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD gerekli.");
  if (password.length < 10) throw new Error("Şifre en az 10 karakter olmalı.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, name: "MuMê Yönetici" },
    update: { passwordHash },
  });
  console.log(`✔ Yönetici hazır: ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

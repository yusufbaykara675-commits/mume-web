import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/actions/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s · MuMê Yönetim" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [orders, reservations, messages] = await Promise.all([
    prisma.order.count({ where: { status: "YENI" } }),
    prisma.reservation.count({ where: { status: "BEKLIYOR" } }),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
  ]);
  return (
    <div className="min-h-screen bg-[#f4efe6] lg:flex">
      <AdminNav badges={{ orders, reservations, messages }} />
      <div className="flex-1">
        <div className="flex items-center justify-end gap-4 border-b border-sand bg-ivory px-5 py-3 text-sm">
          <span className="text-ink/60">{session.email}</span>
          <form action={logout}>
            <button className="font-medium text-espresso hover:text-terracotta">Çıkış yap</button>
          </form>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">{children}</div>
      </div>
    </div>
  );
}

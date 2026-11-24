import { requireAdmin } from "@/lib/auth";
import { changePassword } from "@/actions/admin/auth";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { Input, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Hesap" };

export default async function AccountPage() {
  const session = await requireAdmin();
  return (
    <div className="max-w-xl">
      <PageHeader title="Hesap" text={session.email} />
      <Panel title="Şifre değiştir">
        <AdminForm action={changePassword} resetOnSuccess>
          <Input label="Mevcut şifre" name="current" type="password" autoComplete="current-password" required />
          <Input label="Yeni şifre" name="next" type="password" autoComplete="new-password" minLength={10} required hint="En az 10 karakter. Harf, rakam ve sembol karışık olması önerilir." />
          <Input label="Yeni şifre (tekrar)" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
          <SubmitButton>Şifreyi güncelle</SubmitButton>
        </AdminForm>
      </Panel>
    </div>
  );
}

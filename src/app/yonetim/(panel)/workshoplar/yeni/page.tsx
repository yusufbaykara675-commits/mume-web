import { WorkshopForm } from "@/components/admin/WorkshopForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Yeni workshop" };

export default function NewWorkshopPage() {
  return (
    <div>
      <PageHeader title="Yeni workshop" text="Kaydettikten sonra tarih ve kapasite ekleyebilirsiniz." />
      <WorkshopForm />
    </div>
  );
}

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreateMaterialForm } from "@/features/materials/components/create/CreateMaterialForm"

export function CreateMaterialPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/materials" },
          { label: "Tạo vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateMaterialForm />
      </div>
    </main>
  )
}

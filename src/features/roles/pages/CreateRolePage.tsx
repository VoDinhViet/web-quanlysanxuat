import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { CreateRoleForm } from "@/features/roles/components/CreateRoleForm"

export function CreateRolePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo vai trò"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Vai trò", href: "/manage/roles" },
          { label: "Tạo vai trò" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateRoleForm />
      </div>
    </main>
  )
}

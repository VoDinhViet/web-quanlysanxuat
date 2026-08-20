import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { UpdateUserForm } from "@/features/users/components/UpdateUserForm"

export function UpdateUserPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh Sửa Nhân Sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Nhân sự", href: "/manage/users" },
          { label: "Danh sách nhân sự", href: "/manage/users" },
          { label: "Chỉnh Sửa Nhân Sự" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateUserForm />
      </div>
    </main>
  )
}

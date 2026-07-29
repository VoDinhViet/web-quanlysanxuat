import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateUserForm } from "@/features/users/components/CreateUserForm"

export function CreateUserPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Thêm nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Nhân sự", href: "/manage/users" },
          { label: "Danh sách nhân sự", href: "/manage/users" },
          { label: "Thêm nhân sự" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateUserForm />
      </div>
    </main>
  )
}

import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/page-title-bar"
import { CreateUserForm } from "@/features/users/components/create-user-form"

export function CreateUserPage() {
  const { departments, positions } = useLoaderData({
    from: "/(authed)/manage_/users_/add",
  })

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
        <CreateUserForm departments={departments} positions={positions} />
      </div>
    </main>
  )
}

import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { EditUserForm } from "@/features/users/components/EditUserForm"

export function EditUserPage() {
  const { user, departments, positions } = useLoaderData({
    from: "/(authed)/manage_/users_/$userId/edit",
  })

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
        <EditUserForm
          myUser={user}
          departments={departments}
          positions={positions}
        />
      </div>
    </main>
  )
}

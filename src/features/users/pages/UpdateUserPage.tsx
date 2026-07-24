import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { UpdateUserForm } from "@/features/users/components/UpdateUserForm"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
  rolesQueryOptions,
  userQueryOptions,
} from "@/features/users/users.query"

export function UpdateUserPage() {
  const { userId } = useParams({
    from: "/(authed)/manage_/users_/$userId/update",
  })

  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  const { data: departments } = useSuspenseQuery(departmentsQueryOptions())
  const { data: positions } = useSuspenseQuery(positionsQueryOptions())
  const { data: roles } = useSuspenseQuery(rolesQueryOptions())

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
        <UpdateUserForm
          myUser={user}
          departments={departments}
          positions={positions}
          roles={roles}
        />
      </div>
    </main>
  )
}

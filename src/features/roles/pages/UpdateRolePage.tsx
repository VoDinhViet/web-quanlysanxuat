import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { UpdateRoleForm } from "@/features/roles/components/UpdateRoleForm"
import { roleQueryOptions } from "@/features/roles/api/options"

export function UpdateRolePage() {
  const { roleId } = useParams({
    from: "/(authed)/manage_/roles_/$roleId/update",
  })

  const { data: role } = useSuspenseQuery(roleQueryOptions(roleId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa vai trò"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Vai trò", href: "/manage/roles" },
          { label: "Chỉnh sửa vai trò" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateRoleForm role={role} />
      </div>
    </main>
  )
}

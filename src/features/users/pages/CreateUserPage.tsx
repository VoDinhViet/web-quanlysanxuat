import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateUserForm } from "@/features/users/components/CreateUserForm"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
} from "@/features/users/users.query"

export function CreateUserPage() {
  const { data: departments } = useSuspenseQuery(departmentsQueryOptions())
  const { data: positions } = useSuspenseQuery(positionsQueryOptions())

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

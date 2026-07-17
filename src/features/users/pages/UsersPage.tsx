import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { TablePagination } from "@/components/shared/TablePagination"
import { UsersTable } from "@/features/users/components/UsersTable"
import { UsersTableFilter } from "@/features/users/components/UsersTableFilter"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"

export function UsersPage() {
  // useSearch/useLoaderData key off the file-based route id; useNavigate's `from`
  // keys off the resolved URL path instead — the two intentionally differ.
  const search = useSearch({ from: "/(authed)/manage_/users" })
  const usersResult = useLoaderData({ from: "/(authed)/manage_/users" })
  const navigate = useNavigate({ from: "/manage/users" })

  const handleFilterChange = (patch: Partial<UsersSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Nhân sự" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-8.5rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <UsersTableFilter
                search={search}
                onFilterChange={handleFilterChange}
              />

              <UsersTable rows={usersResult.data} />
              <TablePagination
                pagination={usersResult.pagination}
                className="px-4 py-4 lg:px-5"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

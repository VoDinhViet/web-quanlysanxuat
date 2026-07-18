import {
  Link,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
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
        title="Danh sách nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Danh sách nhân sự" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-13rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 lg:px-5">
                <h2 className="text-base font-bold tracking-wide text-primary uppercase">
                  Quản lý nhân sự
                </h2>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="text-xs">
                    <Download className="size-4" />
                    Export
                  </Button>
                  <PermissionGate permission="users:create">
                    <Button asChild className="text-xs">
                      <Link to="/manage/users/create">
                        <Plus className="size-4" />
                        Thêm nhân sự
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>

              <UsersTableFilter
                search={search}
                onFilterChange={handleFilterChange}
              />

              <UsersTable
                rows={usersResult.data}
                pagination={usersResult.pagination}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

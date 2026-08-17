import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { userColumns } from "@/features/users/components/UsersTableColumns"
import { UsersTableFilter } from "@/features/users/components/UsersTableFilter"
import { usersQueryOptions } from "@/features/users/api/options"

export function UsersPage() {
  // useSearch keys off the file-based route id. The loader prefetched this query
  // for the first paint; the filtered list is a plain useQuery so filter/pagination
  // changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/users" })
  const usersQuery = useQuery({
    ...usersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

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
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <UsersTableFilter />

          {usersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : usersQuery.isError ? (
            <TableQueryError
              error={usersQuery.error.message}
              onRetry={() => void usersQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={usersQuery.data.data}
              columns={userColumns}
              pagination={usersQuery.data.pagination}
              isPending={usersQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={UserRound}
                  title="Chưa có nhân sự nào"
                  description="Bắt đầu bằng cách thêm nhân sự đầu tiên vào hệ thống."
                  action={
                    <PermissionGate permission="users:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/users/create">
                          <Plus className="size-4" />
                          Thêm nhân sự
                        </Link>
                      </Button>
                    </PermissionGate>
                  }
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

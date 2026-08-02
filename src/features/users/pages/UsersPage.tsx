import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { UsersTable } from "@/features/users/components/UsersTable"
import { UsersTableFilter } from "@/features/users/components/UsersTableFilter"
import { usersQueryOptions } from "@/features/users/api/users.options"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"

export function UsersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched this query for the first paint; the filtered list is a plain
  // useQuery so filter/pagination changes only update the table, not the
  // whole route.
  const search = useSearch({ from: "/(authed)/manage_/users" })
  const usersQuery = useQuery({
    ...usersQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const navigate = useNavigate({ from: "/manage/users" })

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the status select) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<UsersSearchSchema>,
    options?: { replace?: boolean }
  ) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: 1 }),
      replace: options?.replace,
    })
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
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <UsersTableFilter
            search={search}
            onFilterChange={handleFilterChange}
          />

          {usersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : usersQuery.isError ? (
            <TableQueryError
              error={usersQuery.error.message}
              onRetry={() => void usersQuery.refetch()}
            />
          ) : (
            <UsersTable
              rows={usersQuery.data.data}
              pagination={usersQuery.data.pagination}
              isPending={usersQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { UsersTable } from "@/features/users/components/sections/UsersTable"
import { UsersTableFilter } from "@/features/users/components/sections/UsersTableFilter"
import { usersQueryOptions } from "@/features/users/api/options"

export function UsersPage() {
  // useSearch keys off the file-based route id. The loader prefetched this query
  // for the first paint; the filtered list is a plain useQuery so filter/pagination
  // changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/users/" })
  const usersQuery = useQuery({
    ...usersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
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
          <UsersTable
            rows={usersQuery.data.data}
            pagination={usersQuery.data.pagination}
            isPending={usersQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

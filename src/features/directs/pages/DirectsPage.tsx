import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { DirectsTable } from "@/features/directs/components/sections/DirectsTable"
import { DirectsTableFilter } from "@/features/directs/components/sections/DirectsTableFilter"
import { directsQueryOptions } from "@/features/directs/api/options"

export function DirectsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/directs/" })

  const directsQuery = useQuery({
    ...directsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <DirectsTableFilter />

        {directsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : directsQuery.isError ? (
          <TableQueryError
            error={directsQuery.error.message}
            onRetry={() => void directsQuery.refetch()}
          />
        ) : (
          <DirectsTable
            rows={directsQuery.data.data}
            pagination={directsQuery.data.pagination}
            isPending={directsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

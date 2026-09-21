import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { ConsumablesTable } from "@/features/consumables/components/sections/ConsumablesTable"
import { ConsumablesTableFilter } from "@/features/consumables/components/sections/ConsumablesTableFilter"
import { consumablesQueryOptions } from "@/features/consumables/api/options"

export function ConsumablesPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/consumables/" })

  const consumablesQuery = useQuery({
    ...consumablesQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <ConsumablesTableFilter />

        {consumablesQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : consumablesQuery.isError ? (
          <TableQueryError
            error={consumablesQuery.error.message}
            onRetry={() => void consumablesQuery.refetch()}
          />
        ) : (
          <ConsumablesTable
            rows={consumablesQuery.data.data}
            pagination={consumablesQuery.data.pagination}
            isPending={consumablesQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

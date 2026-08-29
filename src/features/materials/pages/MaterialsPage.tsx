import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { MaterialsTable } from "@/features/materials/components/MaterialsTable"
import { MaterialsTableFilter } from "@/features/materials/components/MaterialsTableFilter"
import { materialsQueryOptions } from "@/features/materials/api/options"

export function MaterialsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/materials/" })

  const materialsQuery = useQuery({
    ...materialsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <MaterialsTableFilter />

        {materialsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : materialsQuery.isError ? (
          <TableQueryError
            error={materialsQuery.error.message}
            onRetry={() => void materialsQuery.refetch()}
          />
        ) : (
          <MaterialsTable
            rows={materialsQuery.data.data}
            pagination={materialsQuery.data.pagination}
            isPending={materialsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

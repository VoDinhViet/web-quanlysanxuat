import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { SupplierStatCards } from "@/features/suppliers/components/SupplierStatCards"
import { SuppliersTable } from "@/features/suppliers/components/SuppliersTable"
import { SuppliersTableFilter } from "@/features/suppliers/components/SuppliersTableFilter"
import { suppliersQueryOptions } from "@/features/suppliers/api/options"

export function SuppliersPage() {
  // useSearch keys off the file-based route id. The loader prefetches this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. Supplier stats are
  // non-critical — SupplierStatCards reads and awaits them itself. The filter
  // reads/writes this same route search itself (its own useSearch/useNavigate)
  // rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/suppliers/" })

  const suppliersQuery = useQuery({
    ...suppliersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <SupplierStatCards />

      <Surface contentClassName="min-h-[calc(100svh-19rem)]">
        <SuppliersTableFilter />

        {suppliersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : suppliersQuery.isError ? (
          <TableQueryError
            error={suppliersQuery.error.message}
            onRetry={() => void suppliersQuery.refetch()}
          />
        ) : (
          <SuppliersTable
            rows={suppliersQuery.data.data}
            pagination={suppliersQuery.data.pagination}
            isPending={suppliersQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

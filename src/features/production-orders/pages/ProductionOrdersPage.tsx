import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { productionOrdersQueryOptions } from "@/features/production-orders/api/options"
import { ProductionOrdersTable } from "@/features/production-orders/components/ProductionOrdersTable"
import { ProductionOrdersTableFilter } from "@/features/production-orders/components/ProductionOrdersTableFilter"

export function ProductionOrdersPage() {
  // useSearch keys off the file-based route id. The filter reads/writes this
  // same route search itself (its own useSearch/useNavigate) rather than
  // through props, same as OrdersTableFilter.
  const search = useSearch({ from: "/(authed)/manage_/production-orders/" })

  const productionOrdersQuery = useQuery({
    ...productionOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <ProductionOrdersTableFilter />

        {productionOrdersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : productionOrdersQuery.isError ? (
          <TableQueryError
            error={productionOrdersQuery.error.message}
            onRetry={() => void productionOrdersQuery.refetch()}
          />
        ) : (
          <ProductionOrdersTable
            rows={productionOrdersQuery.data.data}
            pagination={productionOrdersQuery.data.pagination}
            isPending={productionOrdersQuery.isFetching}
            status={search.status}
          />
        )}
      </Surface>
    </div>
  )
}

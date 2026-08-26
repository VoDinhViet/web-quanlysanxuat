import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { ProductsTable } from "@/features/products/components/ProductsTable"
import { ProductsTableFilter } from "@/features/products/components/ProductsTableFilter"
import { itemsQueryOptions } from "@/features/products/api/options"

export function ProductsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/products/" })

  const productsQuery = useQuery({
    ...itemsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <ProductsTableFilter />

        {productsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : productsQuery.isError ? (
          <TableQueryError
            error={productsQuery.error.message}
            onRetry={() => void productsQuery.refetch()}
          />
        ) : (
          <ProductsTable
            rows={productsQuery.data.data}
            pagination={productsQuery.data.pagination}
            isPending={productsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

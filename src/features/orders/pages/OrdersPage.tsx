import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { OrderStatCards } from "@/features/orders/components/sections/OrderStatCards"
import { OrderStatusLegend } from "@/features/orders/components/primitives/OrderStatusLegend"
import { OrdersTable } from "@/features/orders/components/sections/OrdersTable"
import { OrdersTableFilter } from "@/features/orders/components/sections/OrdersTableFilter"
import { ordersQueryOptions } from "@/features/orders/api/options"

export function OrdersPage() {
  // useSearch keys off the file-based route id. The loader prefetches this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. Order stats are non-critical — OrderStatCards
  // reads and awaits them itself. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/orders/" })

  const ordersQuery = useQuery({
    ...ordersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <OrderStatCards />

      <Surface contentClassName="min-h-[calc(100svh-25rem)]">
        <OrdersTableFilter />

        {ordersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : ordersQuery.isError ? (
          <TableQueryError
            error={ordersQuery.error.message}
            onRetry={() => void ordersQuery.refetch()}
          />
        ) : (
          <OrdersTable
            rows={ordersQuery.data.data}
            pagination={ordersQuery.data.pagination}
            isPending={ordersQuery.isFetching}
          />
        )}
      </Surface>

      <OrderStatusLegend />
    </div>
  )
}

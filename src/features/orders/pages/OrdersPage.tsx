import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryFallback } from "@/components/shared/TableQueryFallback"
import { OrderStatCards } from "@/features/orders/components/OrderStatCards"
import { OrderStatusLegend } from "@/features/orders/components/OrderStatusLegend"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { OrdersTableFilter } from "@/features/orders/components/OrdersTableFilter"
import {
  orderStatsQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/api/orders.options"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export function OrdersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries; the reference lists resolve synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/orders" })
  const navigate = useNavigate({ from: "/manage/orders" })

  const ordersQuery = useQuery({
    ...ordersQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { data: stats } = useSuspenseQuery(orderStatsQueryOptions())

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<OrdersSearchSchema>,
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
        title="Đơn hàng (Sales Order)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Bán hàng" },
          { label: "Danh sách đơn hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <OrderStatCards stats={stats} />

        <Surface contentClassName="min-h-[calc(100svh-25rem)]">
          <OrdersTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            salesRepOptions={[]}
          />

          {ordersQuery.isPending ? (
            <TableQueryFallback status="pending" />
          ) : ordersQuery.isError ? (
            <TableQueryFallback
              status="error"
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
    </main>
  )
}

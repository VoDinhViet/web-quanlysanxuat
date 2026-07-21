import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { OrderStatCards } from "@/features/orders/components/OrderStatCards"
import { OrderStatusLegend } from "@/features/orders/components/OrderStatusLegend"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { OrdersTableFilter } from "@/features/orders/components/OrdersTableFilter"
import {
  orderStatsQueryOptions,
  ordersQueryOptions,
  salesRepOptionsQueryOptions,
} from "@/features/orders/orders.query"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export function OrdersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries, so useSuspenseQuery resolves synchronously.
  const search = useSearch({ from: "/(authed)/manage_/orders" })
  const navigate = useNavigate({ from: "/manage/orders" })

  const { data: orders } = useSuspenseQuery(ordersQueryOptions(search))
  const { data: stats } = useSuspenseQuery(orderStatsQueryOptions())
  const { data: salesRepOptions } = useSuspenseQuery(
    salesRepOptionsQueryOptions()
  )

  const isFiltered = Boolean(
    search.q ||
    search.status ||
    search.paymentTerm ||
    search.salesRepId ||
    search.orderDateFrom ||
    search.orderDateTo
  )

  const handleFilterChange = (patch: Partial<OrdersSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
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

        <section className="overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-foreground/6">
          <div className="flex min-h-[calc(100svh-25rem)] min-w-0 flex-col">
            <OrdersTableFilter
              search={search}
              onFilterChange={handleFilterChange}
              salesRepOptions={salesRepOptions}
            />

            <OrdersTable
              rows={orders.data}
              pagination={orders.pagination}
              isFiltered={isFiltered}
            />
          </div>
        </section>

        <OrderStatusLegend />
      </div>
    </main>
  )
}

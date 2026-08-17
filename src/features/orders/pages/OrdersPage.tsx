import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ClipboardList } from "lucide-react"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { OrderStatCards } from "@/features/orders/components/OrderStatCards"
import { OrderStatusLegend } from "@/features/orders/components/OrderStatusLegend"
import { orderColumns } from "@/features/orders/components/OrdersTableColumns"
import { OrdersTableFilter } from "@/features/orders/components/OrdersTableFilter"
import { ordersQueryOptions } from "@/features/orders/api/options"

export function OrdersPage() {
  // useSearch keys off the file-based route id. The loader prefetches this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. Order stats are non-critical — OrderStatCards
  // reads and awaits them itself. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/orders" })

  const ordersQuery = useQuery({
    ...ordersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

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
            <DataTable
              rows={ordersQuery.data.data}
              columns={orderColumns}
              pagination={ordersQuery.data.pagination}
              isPending={ordersQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={ClipboardList}
                  title="Chưa có đơn hàng nào"
                  description="Đơn hàng sẽ xuất hiện ở đây sau khi được tạo."
                />
              }
            />
          )}
        </Surface>

        <OrderStatusLegend />
      </div>
    </main>
  )
}

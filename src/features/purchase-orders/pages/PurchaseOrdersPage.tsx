import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrderLegend } from "@/features/purchase-orders/components/PurchaseOrderLegend"
import { PurchaseOrdersTable } from "@/features/purchase-orders/components/PurchaseOrdersTable"
import { PurchaseOrdersTableFilter } from "@/features/purchase-orders/components/PurchaseOrdersTableFilter"

export function PurchaseOrdersPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole route.
  // The filter reads/writes this same route search itself.
  const search = useSearch({ from: "/(authed)/manage_/purchase-orders" })

  const purchaseOrdersQuery = useQuery({
    ...purchaseOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Đơn mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đơn mua hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <PurchaseOrdersTableFilter />

          {purchaseOrdersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : purchaseOrdersQuery.isError ? (
            <TableQueryError
              error={purchaseOrdersQuery.error.message}
              onRetry={() => void purchaseOrdersQuery.refetch()}
            />
          ) : (
            <PurchaseOrdersTable
              rows={purchaseOrdersQuery.data.data}
              pagination={purchaseOrdersQuery.data.pagination}
              isPending={purchaseOrdersQuery.isFetching}
            />
          )}
        </Surface>

        <PurchaseOrderLegend />
      </div>
    </main>
  )
}

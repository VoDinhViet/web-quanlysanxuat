import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { inventoryReceiptsQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptsTable } from "@/features/inventory-receipts/components/InventoryReceiptsTable"
import { InventoryReceiptsTableFilter } from "@/features/inventory-receipts/components/InventoryReceiptsTableFilter"
import { InventoryReceiptLegend } from "@/features/inventory-receipts/components/InventoryReceiptLegend"

export function InventoryReceiptsPage() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-receipts" })

  const inventoryReceiptsQuery = useQuery({
    ...inventoryReceiptsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập kho"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <InventoryReceiptsTableFilter />

          {inventoryReceiptsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : inventoryReceiptsQuery.isError ? (
            <TableQueryError
              error={inventoryReceiptsQuery.error.message}
              onRetry={() => void inventoryReceiptsQuery.refetch()}
            />
          ) : (
            <InventoryReceiptsTable
              rows={inventoryReceiptsQuery.data.data}
              pagination={inventoryReceiptsQuery.data.pagination}
              isPending={inventoryReceiptsQuery.isFetching}
            />
          )}
        </Surface>

        <InventoryReceiptLegend />
      </div>
    </main>
  )
}

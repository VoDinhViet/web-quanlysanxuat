import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ArrowDownToLine } from "lucide-react"

import { DataTable } from "@/components/shared/data/DataTable"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { inventoryReceiptsQueryOptions } from "@/features/inventory-receipts/api/options"
import { inventoryReceiptsColumns } from "@/features/inventory-receipts/components/InventoryReceiptsTableColumns"
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
            <DataTable
              rows={inventoryReceiptsQuery.data.data}
              columns={inventoryReceiptsColumns}
              pagination={inventoryReceiptsQuery.data.pagination}
              isPending={inventoryReceiptsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={ArrowDownToLine}
                  title="Chưa có phiếu nhập kho nào"
                  description="Phiếu nhập kho sẽ hiển thị tại đây sau khi được lập từ PO, hàng trả hoặc nhập khác."
                />
              }
            />
          )}
        </Surface>

        <InventoryReceiptLegend />
      </div>
    </main>
  )
}

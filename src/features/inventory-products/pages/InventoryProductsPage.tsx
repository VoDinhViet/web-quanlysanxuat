import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Boxes } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api/options"
import { inventoryProductsColumns } from "@/features/inventory-products/components/InventoryProductsTableColumns"
import { InventoryProductsTableFilter } from "@/features/inventory-products/components/InventoryProductsTableFilter"
import { InventoryProductLegend } from "@/features/inventory-products/components/InventoryProductLegend"

export function InventoryProductsPage() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-products" })

  const inventoryProductsQuery = useQuery({
    ...inventoryProductsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách tồn kho thành phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Tồn kho thành phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <InventoryProductsTableFilter />

          {inventoryProductsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : inventoryProductsQuery.isError ? (
            <TableQueryError
              error={inventoryProductsQuery.error.message}
              onRetry={() => void inventoryProductsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={inventoryProductsQuery.data.data}
              columns={inventoryProductsColumns}
              pagination={inventoryProductsQuery.data.pagination}
              isPending={inventoryProductsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={Boxes}
                  title="Chưa có thành phẩm nào trong kho"
                  description="Dữ liệu tồn kho thành phẩm sẽ hiển thị khi có kết quả nhập kho thành phẩm."
                />
              }
            />
          )}
        </Surface>

        <InventoryProductLegend />
      </div>
    </main>
  )
}

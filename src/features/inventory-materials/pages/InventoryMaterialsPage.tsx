import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Warehouse } from "lucide-react"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { inventoryMaterialColumns } from "@/features/inventory-materials/components/InventoryMaterialsTableColumns"
import { InventoryMaterialsTableFilter } from "@/features/inventory-materials/components/InventoryMaterialsTableFilter"
import { materialInventoryQueryOptions } from "@/features/inventory-materials/api/options/material-inventory.options"
import type { MaterialInventoryItem } from "@/lib/types/inventory-material.type"

// Flags shortage rows with a left accent so they stand out down the whole
// list, not just within their own row's status badge.
function inventoryRowClassName(
  item: MaterialInventoryItem
): string | undefined {
  return item.status === "SHORTAGE"
    ? "border-l-2 border-l-destructive"
    : undefined
}

export function InventoryMaterialsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list +
  // warehouse options; the list is read via useQuery so filter/pagination changes
  // only update the table (not the whole route), while the reference lists resolve
  // synchronously via useSuspenseQuery. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) rather than through props.
  const search = useSearch({
    from: "/(authed)/manage_/inventory-materials",
  })

  const inventoryQuery = useQuery({
    ...materialInventoryQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tồn kho vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Tồn kho vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <InventoryMaterialsTableFilter />

          {inventoryQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : inventoryQuery.isError ? (
            <TableQueryError
              error={inventoryQuery.error.message}
              onRetry={() => void inventoryQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={inventoryQuery.data.data}
              columns={inventoryMaterialColumns}
              pagination={inventoryQuery.data.pagination}
              isPending={inventoryQuery.isFetching}
              rowClassName={inventoryRowClassName}
              emptyState={
                <TableEmptyState
                  icon={Warehouse}
                  title="Không có vật tư nào"
                  description="Thử thay đổi bộ lọc hoặc kiểm tra lại thời gian xem tồn."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

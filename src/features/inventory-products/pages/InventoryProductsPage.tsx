import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api/options"
import { InventoryProductsTable } from "@/features/inventory-products/components/InventoryProductsTable"
import { InventoryProductsTableFilter } from "@/features/inventory-products/components/InventoryProductsTableFilter"
import { InventoryProductLegend } from "@/features/inventory-products/components/InventoryProductLegend"

export function InventoryProductsPage() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-products/" })

  const inventoryProductsQuery = useQuery({
    ...inventoryProductsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
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
          <InventoryProductsTable
            rows={inventoryProductsQuery.data.data}
            pagination={inventoryProductsQuery.data.pagination}
            isPending={inventoryProductsQuery.isFetching}
          />
        )}
      </Surface>

      <InventoryProductLegend />
    </div>
  )
}

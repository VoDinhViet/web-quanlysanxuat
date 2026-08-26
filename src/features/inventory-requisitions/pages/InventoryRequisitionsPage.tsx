import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { inventoryRequisitionsQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionsTable } from "@/features/inventory-requisitions/components/InventoryRequisitionsTable"
import { InventoryRequisitionsTableFilter } from "@/features/inventory-requisitions/components/InventoryRequisitionsTableFilter"
import { InventoryRequisitionsLegend } from "@/features/inventory-requisitions/components/InventoryRequisitionsLegend"

export function InventoryRequisitionsPage() {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-requisitions/",
  })

  const inventoryRequisitionsQuery = useQuery({
    ...inventoryRequisitionsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <InventoryRequisitionsTableFilter />

        {inventoryRequisitionsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : inventoryRequisitionsQuery.isError ? (
          <TableQueryError
            error={inventoryRequisitionsQuery.error.message}
            onRetry={() => void inventoryRequisitionsQuery.refetch()}
          />
        ) : (
          <InventoryRequisitionsTable
            rows={inventoryRequisitionsQuery.data.data}
            pagination={inventoryRequisitionsQuery.data.pagination}
            isPending={inventoryRequisitionsQuery.isFetching}
          />
        )}
      </Surface>

      <InventoryRequisitionsLegend />
    </div>
  )
}

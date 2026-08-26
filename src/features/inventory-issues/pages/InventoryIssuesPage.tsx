import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { inventoryIssuesQueryOptions } from "@/features/inventory-issues/api/options"
import { InventoryIssuesTable } from "@/features/inventory-issues/components/InventoryIssuesTable"
import { InventoryIssuesTableFilter } from "@/features/inventory-issues/components/InventoryIssuesTableFilter"
import { InventoryIssuesLegend } from "@/features/inventory-issues/components/InventoryIssuesLegend"

export function InventoryIssuesPage() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-issues/" })

  const inventoryIssuesQuery = useQuery({
    ...inventoryIssuesQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <InventoryIssuesTableFilter />

        {inventoryIssuesQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : inventoryIssuesQuery.isError ? (
          <TableQueryError
            error={inventoryIssuesQuery.error.message}
            onRetry={() => void inventoryIssuesQuery.refetch()}
          />
        ) : (
          <InventoryIssuesTable
            rows={inventoryIssuesQuery.data.data}
            pagination={inventoryIssuesQuery.data.pagination}
            isPending={inventoryIssuesQuery.isFetching}
          />
        )}
      </Surface>

      <InventoryIssuesLegend />
    </div>
  )
}

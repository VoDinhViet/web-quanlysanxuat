import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageBody } from "@/components/shared/layouts/PageBody"
import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryBoundary } from "@/components/shared/sections/TableQueryBoundary"
import { inventoryRequisitionsQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionsTable } from "@/features/inventory-requisitions/components/sections/InventoryRequisitionsTable"
import { InventoryRequisitionsTableFilter } from "@/features/inventory-requisitions/components/sections/InventoryRequisitionsTableFilter"
import { InventoryRequisitionsLegend } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionsLegend"

export function InventoryRequisitionsPage() {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-requisitions/",
  })

  const inventoryRequisitionsQuery = useQuery({
    ...inventoryRequisitionsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <PageBody>
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <InventoryRequisitionsTableFilter />

        <TableQueryBoundary
          query={inventoryRequisitionsQuery}
          loadingRows={search.limit}
        >
          {(data) => (
            <InventoryRequisitionsTable
              rows={data.data}
              pagination={data.pagination}
              isPending={inventoryRequisitionsQuery.isFetching}
            />
          )}
        </TableQueryBoundary>
      </Surface>

      <InventoryRequisitionsLegend />
    </PageBody>
  )
}

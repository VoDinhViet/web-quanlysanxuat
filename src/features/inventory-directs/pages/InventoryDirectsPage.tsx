import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { InventoryDirectsTable } from "@/features/inventory-directs/components/sections/InventoryDirectsTable"
import { InventoryDirectsTableFilter } from "@/features/inventory-directs/components/sections/InventoryDirectsTableFilter"
import { directInventoryQueryOptions } from "@/features/inventory-directs/api/options"

export function InventoryDirectsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list +
  // supplier options; the list is read via useQuery so filter/pagination changes
  // only update the table (not the whole route), while the reference lists resolve
  // synchronously via useSuspenseQuery. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) rather than through props.
  const search = useSearch({
    from: "/(authed)/manage_/inventory-directs/",
  })

  const inventoryQuery = useQuery({
    ...directInventoryQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <InventoryDirectsTableFilter />

        {inventoryQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : inventoryQuery.isError ? (
          <TableQueryError
            error={inventoryQuery.error.message}
            onRetry={() => void inventoryQuery.refetch()}
          />
        ) : (
          <InventoryDirectsTable
            rows={inventoryQuery.data.data}
            pagination={inventoryQuery.data.pagination}
            isPending={inventoryQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

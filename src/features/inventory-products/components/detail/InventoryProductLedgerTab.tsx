import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { InventoryProductLedgerTable } from "@/features/inventory-products/components/detail/InventoryProductLedgerTable"
import { productLedgerQueryOptions } from "@/features/inventory-products/api/options"

type InventoryProductLedgerTabProps = {
  itemId: string
}

// "Thẻ kho thành phẩm" — this item's own transaction history, client-driven (page/limit/date
// range live in the route's own search params). The date filter itself renders in the page's
// section header row, not here — see InventoryProductLedgerDateFilter.tsx.
export function InventoryProductLedgerTab({
  itemId,
}: InventoryProductLedgerTabProps) {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-products_/$itemId",
  })

  const page = search.page ?? 1
  const limit = search.limit ?? 10

  const ledgerQuery = useQuery({
    ...productLedgerQueryOptions(itemId, {
      page,
      limit,
      startDate: search.startDate,
      endDate: search.endDate,
    }),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex min-w-0 flex-col pt-4">
      {ledgerQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : ledgerQuery.isError ? (
        <TableQueryError
          error={ledgerQuery.error.message}
          onRetry={() => void ledgerQuery.refetch()}
        />
      ) : (
        <InventoryProductLedgerTable
          rows={ledgerQuery.data.data}
          pagination={ledgerQuery.data.pagination}
          isPending={ledgerQuery.isFetching}
        />
      )}
    </div>
  )
}

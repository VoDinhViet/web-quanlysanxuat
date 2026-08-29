import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options"
import { PurchaseLedgerLegend } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerLegend"
import { PurchaseLedgerTable } from "@/features/purchase-ledger/components/sections/PurchaseLedgerTable"
import { PurchaseLedgerTableFilter } from "@/features/purchase-ledger/components/sections/PurchaseLedgerTableFilter"

export function PurchaseLedgerPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole
  // route. The filter reads/writes this same route search itself.
  const search = useSearch({ from: "/(authed)/manage_/purchase-ledger/" })

  const purchaseLedgerQuery = useQuery({
    ...purchaseLedgerQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <PurchaseLedgerTableFilter />

        {purchaseLedgerQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : purchaseLedgerQuery.isError ? (
          <TableQueryError
            error={purchaseLedgerQuery.error.message}
            onRetry={() => void purchaseLedgerQuery.refetch()}
          />
        ) : (
          <PurchaseLedgerTable
            rows={purchaseLedgerQuery.data.data}
            pagination={purchaseLedgerQuery.data.pagination}
            isPending={purchaseLedgerQuery.isFetching}
          />
        )}
      </Surface>

      <PurchaseLedgerLegend />
    </div>
  )
}

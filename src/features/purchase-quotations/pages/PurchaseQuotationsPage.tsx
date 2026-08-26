import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationLegend } from "@/features/purchase-quotations/components/PurchaseQuotationLegend"
import { PurchaseQuotationsTable } from "@/features/purchase-quotations/components/PurchaseQuotationsTable"
import { PurchaseQuotationsTableFilter } from "@/features/purchase-quotations/components/PurchaseQuotationsTableFilter"

export function PurchaseQuotationsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole route.
  // The filter reads/writes this same route search itself.
  const search = useSearch({
    from: "/(authed)/manage_/purchase-quotations/",
  })

  const purchaseQuotationsQuery = useQuery({
    ...purchaseQuotationsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <PurchaseQuotationsTableFilter />

        {purchaseQuotationsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : purchaseQuotationsQuery.isError ? (
          <TableQueryError
            error={purchaseQuotationsQuery.error.message}
            onRetry={() => void purchaseQuotationsQuery.refetch()}
          />
        ) : (
          <PurchaseQuotationsTable
            rows={purchaseQuotationsQuery.data.data}
            pagination={purchaseQuotationsQuery.data.pagination}
            isPending={purchaseQuotationsQuery.isFetching}
          />
        )}
      </Surface>

      <PurchaseQuotationLegend />
    </div>
  )
}

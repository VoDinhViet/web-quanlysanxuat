import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { PurchaseRequestsTable } from "@/features/purchase-requests/components/PurchaseRequestsTable"
import { PurchaseRequestsTableFilter } from "@/features/purchase-requests/components/PurchaseRequestsTableFilter"
import { purchaseRequestsQueryOptions } from "@/features/purchase-requests/api/options"

export function PurchaseRequestsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the
  // list, which resolves via a plain useQuery so filter/pagination changes
  // only update the table, not the whole route. The filter reads/writes this
  // same route search itself (its own useSearch/useNavigate) and fetches its
  // own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/purchase-requests/" })

  const purchaseRequestsQuery = useQuery({
    ...purchaseRequestsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <PurchaseRequestsTableFilter />

        {purchaseRequestsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : purchaseRequestsQuery.isError ? (
          <TableQueryError
            error={purchaseRequestsQuery.error.message}
            onRetry={() => void purchaseRequestsQuery.refetch()}
          />
        ) : (
          <PurchaseRequestsTable
            rows={purchaseRequestsQuery.data.data}
            pagination={purchaseRequestsQuery.data.pagination}
            isPending={purchaseRequestsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { paymentRequestsQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestsTable } from "@/features/payment-requests/components/PaymentRequestsTable"
import { PaymentRequestsTableFilter } from "@/features/payment-requests/components/PaymentRequestsTableFilter"

export function PaymentRequestsPage() {
  const search = useSearch({ from: "/(authed)/manage_/payment-requests/" })

  const paymentRequestsQuery = useQuery({
    ...paymentRequestsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <PaymentRequestsTableFilter />

        {paymentRequestsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : paymentRequestsQuery.isError ? (
          <TableQueryError
            error={paymentRequestsQuery.error.message}
            onRetry={() => void paymentRequestsQuery.refetch()}
          />
        ) : (
          <PaymentRequestsTable
            rows={paymentRequestsQuery.data.data}
            pagination={paymentRequestsQuery.data.pagination}
            isPending={paymentRequestsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

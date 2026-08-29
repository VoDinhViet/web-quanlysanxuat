import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrdersTable } from "@/features/outbound-orders/components/OutboundOrdersTable"
import { OutboundOrdersTableFilter } from "@/features/outbound-orders/components/OutboundOrdersTableFilter"

export function OutboundOrdersPage() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders/" })

  const outboundOrdersQuery = useQuery({
    ...outboundOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <OutboundOrdersTableFilter />

        {outboundOrdersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : outboundOrdersQuery.isError ? (
          <TableQueryError
            error={outboundOrdersQuery.error.message}
            onRetry={() => void outboundOrdersQuery.refetch()}
          />
        ) : (
          <OutboundOrdersTable
            rows={outboundOrdersQuery.data.data}
            pagination={outboundOrdersQuery.data.pagination}
            isPending={outboundOrdersQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

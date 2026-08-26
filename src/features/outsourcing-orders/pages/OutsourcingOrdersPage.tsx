import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { OutsourcingTabs } from "@/components/shared/layout/OutsourcingTabs"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { outsourcingOrdersQueryOptions } from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderLegend } from "@/features/outsourcing-orders/components/OutsourcingOrderLegend"
import { OutsourcingOrdersTable } from "@/features/outsourcing-orders/components/OutsourcingOrdersTable"
import { OutsourcingOrdersTableFilter } from "@/features/outsourcing-orders/components/OutsourcingOrdersTableFilter"

export function OutsourcingOrdersPage() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-orders/" })

  const outsourcingOrdersQuery = useQuery({
    ...outsourcingOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <OutsourcingTabs />
        <OutsourcingOrdersTableFilter />

        {outsourcingOrdersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : outsourcingOrdersQuery.isError ? (
          <TableQueryError
            error={outsourcingOrdersQuery.error.message}
            onRetry={() => void outsourcingOrdersQuery.refetch()}
          />
        ) : (
          <OutsourcingOrdersTable
            rows={outsourcingOrdersQuery.data.data}
            pagination={outsourcingOrdersQuery.data.pagination}
            isPending={outsourcingOrdersQuery.isFetching}
          />
        )}
      </Surface>

      <OutsourcingOrderLegend />
    </div>
  )
}

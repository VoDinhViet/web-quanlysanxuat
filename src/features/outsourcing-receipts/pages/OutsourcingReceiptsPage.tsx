import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { OutsourcingTabs } from "@/components/shared/layouts/OutsourcingTabs"
import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptLegend } from "@/features/outsourcing-receipts/components/OutsourcingReceiptLegend"
import { OutsourcingReceiptsTable } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTable"
import { OutsourcingReceiptsTableFilter } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTableFilter"

export function OutsourcingReceiptsPage() {
  const search = useSearch({
    from: "/(authed)/manage_/outsourcing-receipts/",
  })

  const outsourcingReceiptsQuery = useQuery({
    ...outsourcingReceiptsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <OutsourcingTabs />
        <OutsourcingReceiptsTableFilter />

        {outsourcingReceiptsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : outsourcingReceiptsQuery.isError ? (
          <TableQueryError
            error={outsourcingReceiptsQuery.error.message}
            onRetry={() => void outsourcingReceiptsQuery.refetch()}
          />
        ) : (
          <OutsourcingReceiptsTable
            rows={outsourcingReceiptsQuery.data.data}
            pagination={outsourcingReceiptsQuery.data.pagination}
            isPending={outsourcingReceiptsQuery.isFetching}
          />
        )}
      </Surface>

      <OutsourcingReceiptLegend />
    </div>
  )
}

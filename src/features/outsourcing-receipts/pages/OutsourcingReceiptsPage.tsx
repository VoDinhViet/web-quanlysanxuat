import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptsTable } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTable"
import { OutsourcingReceiptsTableFilter } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTableFilter"

export function OutsourcingReceiptsPage() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-receipts" })

  const outsourcingReceiptsQuery = useQuery({
    ...outsourcingReceiptsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập về gia công ngoài (OS-IN)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Gia công ngoài" },
          { label: "Nhập về (OS-IN)" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
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
      </div>
    </main>
  )
}

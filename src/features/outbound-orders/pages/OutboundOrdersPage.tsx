import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrdersTable } from "@/features/outbound-orders/components/OutboundOrdersTable"
import { OutboundOrdersTableFilter } from "@/features/outbound-orders/components/OutboundOrdersTableFilter"

export function OutboundOrdersPage() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders" })

  const outboundOrdersQuery = useQuery({
    ...outboundOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách giao hàng (DO)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý bán hàng" },
          { label: "Giao hàng (DO)" },
        ]}
        notificationCount={5}
      />

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
    </main>
  )
}

import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Send } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { outsourcingOrdersQueryOptions } from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderLegend } from "@/features/outsourcing-orders/components/OutsourcingOrderLegend"
import { OutsourcingOrderQuickAccess } from "@/features/outsourcing-orders/components/OutsourcingOrderQuickAccess"
import { OutsourcingOrderTabs } from "@/features/outsourcing-orders/components/OutsourcingOrderTabs"
import { outsourcingOrdersColumns } from "@/features/outsourcing-orders/components/OutsourcingOrdersTableColumns"
import { OutsourcingOrdersTableFilter } from "@/features/outsourcing-orders/components/OutsourcingOrdersTableFilter"

export function OutsourcingOrdersPage() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-orders" })

  const outsourcingOrdersQuery = useQuery({
    ...outsourcingOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Gia công ngoài"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Gia công ngoài" },
          { label: "Xuất đi gia công (OS-OUT)" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <OutsourcingOrderTabs />
          <OutsourcingOrdersTableFilter />

          {outsourcingOrdersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : outsourcingOrdersQuery.isError ? (
            <TableQueryError
              error={outsourcingOrdersQuery.error.message}
              onRetry={() => void outsourcingOrdersQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={outsourcingOrdersQuery.data.data}
              columns={outsourcingOrdersColumns}
              pagination={outsourcingOrdersQuery.data.pagination}
              isPending={outsourcingOrdersQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={Send}
                  title="Chưa có phiếu gia công ngoài nào"
                  description="Phiếu xuất đi gia công (OS-OUT) sẽ hiển thị tại đây sau khi được tạo."
                />
              }
            />
          )}
        </Surface>

        <OutsourcingOrderLegend />
        <OutsourcingOrderQuickAccess />
      </div>
    </main>
  )
}

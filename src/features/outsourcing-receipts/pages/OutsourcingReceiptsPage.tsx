import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Upload } from "lucide-react"

import { DataTable } from "@/components/shared/data/DataTable"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { outsourcingReceiptsColumns } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTableColumns"
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
            <DataTable
              rows={outsourcingReceiptsQuery.data.data}
              columns={outsourcingReceiptsColumns}
              pagination={outsourcingReceiptsQuery.data.pagination}
              isPending={outsourcingReceiptsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={Upload}
                  title="Chưa có phiếu nhận gia công ngoài nào"
                  description="Phiếu OS-IN sẽ hiển thị tại đây sau khi được lập từ phiếu gửi gia công (OS-OUT) đã Đã xuất."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

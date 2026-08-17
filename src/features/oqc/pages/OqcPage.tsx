import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"

import { DataTable } from "@/components/shared/data/DataTable"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { oqcsQueryOptions } from "@/features/oqc/api/options"
import { oqcColumns } from "@/features/oqc/components/OqcTableColumns"
import { OqcTableFilter } from "@/features/oqc/components/OqcTableFilter"

// No stat cards — unlike IQC, the backend has no GET /oqc/stats, so the content area doesn't
// reserve the extra ~6rem IqcPage's Surface does.
export function OqcPage() {
  const search = useSearch({ from: "/(authed)/manage_/oqc" })

  const oqcsQuery = useQuery({
    ...oqcsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách OQC"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "OQC" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <OqcTableFilter />

          {oqcsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : oqcsQuery.isError ? (
            <TableQueryError
              error={oqcsQuery.error.message}
              onRetry={() => void oqcsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={oqcsQuery.data.data}
              columns={oqcColumns}
              pagination={oqcsQuery.data.pagination}
              isPending={oqcsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={ClipboardCheck}
                  title="Chưa có phiếu OQC nào"
                  description="Phiếu OQC sẽ hiển thị tại đây sau khi Sản xuất yêu cầu QC cho một lô thành phẩm."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

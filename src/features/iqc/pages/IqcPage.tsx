import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"

import { DataTable } from "@/components/shared/data/DataTable"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { iqcsQueryOptions } from "@/features/iqc/api/options"
import { IqcStatCards } from "@/features/iqc/components/IqcStatCards"
import { iqcColumns } from "@/features/iqc/components/IqcTableColumns"
import { IqcTableFilter } from "@/features/iqc/components/IqcTableFilter"

export function IqcPage() {
  // useSearch keys off the file-based route id. The loader prefetches this query; it's a plain
  // useQuery (not useSuspenseQuery) so filter/pagination changes only update the table, not the
  // whole route. IQC stats are non-critical — IqcStatCards reads and awaits them itself. The
  // filter reads/writes this same route search itself (its own useSearch/useNavigate) rather than
  // through props.
  const search = useSearch({ from: "/(authed)/manage_/iqc" })

  const iqcsQuery = useQuery({
    ...iqcsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách IQC"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "IQC" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <IqcStatCards />

        <Surface contentClassName="min-h-[calc(100svh-19rem)]">
          <IqcTableFilter />

          {iqcsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : iqcsQuery.isError ? (
            <TableQueryError
              error={iqcsQuery.error.message}
              onRetry={() => void iqcsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={iqcsQuery.data.data}
              columns={iqcColumns}
              pagination={iqcsQuery.data.pagination}
              isPending={iqcsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={ClipboardCheck}
                  title="Chưa có phiếu IQC nào"
                  description="Phiếu IQC sẽ hiển thị tại đây sau khi kiểm tra chất lượng vật tư đầu vào."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

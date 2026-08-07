import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { Factory } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { DataTable } from "@/components/shared/DataTable"
import { productionJobColumns } from "@/features/production-jobs/components/ProductionJobsTableColumns"
import { ProductionJobsTableFilter } from "@/features/production-jobs/components/ProductionJobsTableFilter"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"

export function ProductionJobsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) and fetches its own
  // reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/production-jobs" })

  const productionJobsQuery = useQuery({
    ...productionJobsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý sản xuất"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý sản xuất" },
          { label: "Danh sách Job" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <ProductionJobsTableFilter />

          {productionJobsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productionJobsQuery.isError ? (
            <TableQueryError
              error={productionJobsQuery.error.message}
              onRetry={() => void productionJobsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={productionJobsQuery.data.data}
              columns={productionJobColumns}
              pagination={productionJobsQuery.data.pagination}
              isPending={productionJobsQuery.isFetching}
              emptyState={
                // No action button — a Job is created automatically when its
                // LSX (production order) is approved, never by hand from this
                // screen.
                <TableEmptyState
                  icon={Factory}
                  title="Chưa có Job nào"
                  description="Job được tạo tự động khi Lệnh sản xuất (LSX) được duyệt."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

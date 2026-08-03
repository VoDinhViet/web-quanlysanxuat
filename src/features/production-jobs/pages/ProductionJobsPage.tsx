import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { ProductionJobsTable } from "@/features/production-jobs/components/ProductionJobsTable"
import { ProductionJobsTableFilter } from "@/features/production-jobs/components/ProductionJobsTableFilter"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"
import { clientOptionsQueryOptions } from "@/features/clients/api"
import type { ProductionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"

export function ProductionJobsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched both queries; the client reference list resolves synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/production-jobs" })
  const navigate = useNavigate({ from: "/manage/production-jobs" })

  const productionJobsQuery = useQuery({
    ...productionJobsQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { data: clientOptions } = useSuspenseQuery(
    clientOptionsQueryOptions("")
  )

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects, the combobox, the date range) stay on push so
  // Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<ProductionJobsSearchSchema>,
    options?: { replace?: boolean }
  ) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: 1 }),
      replace: options?.replace,
    })
  }

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
          <ProductionJobsTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            clientOptions={clientOptions}
          />

          {productionJobsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productionJobsQuery.isError ? (
            <TableQueryError
              error={productionJobsQuery.error.message}
              onRetry={() => void productionJobsQuery.refetch()}
            />
          ) : (
            <ProductionJobsTable
              rows={productionJobsQuery.data.data}
              pagination={productionJobsQuery.data.pagination}
              isPending={productionJobsQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

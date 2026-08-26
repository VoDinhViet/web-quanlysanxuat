import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { ProductionJobsTable } from "@/features/production-jobs/components/ProductionJobsTable"
import { ProductionJobsTableFilter } from "@/features/production-jobs/components/ProductionJobsTableFilter"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"

export function ProductionJobsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) and fetches its own
  // reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/production-jobs/" })

  const productionJobsQuery = useQuery({
    ...productionJobsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
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
          <ProductionJobsTable
            rows={productionJobsQuery.data.data}
            pagination={productionJobsQuery.data.pagination}
            isPending={productionJobsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

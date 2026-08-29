import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { iqcsQueryOptions } from "@/features/iqc/api/options"
import { IqcStatCards } from "@/features/iqc/components/IqcStatCards"
import { IqcTable } from "@/features/iqc/components/IqcTable"
import { IqcTableFilter } from "@/features/iqc/components/IqcTableFilter"

export function IqcPage() {
  // useSearch keys off the file-based route id. The loader prefetches this query; it's a plain
  // useQuery (not useSuspenseQuery) so filter/pagination changes only update the table, not the
  // whole route. IQC stats are non-critical — IqcStatCards reads and awaits them itself. The
  // filter reads/writes this same route search itself (its own useSearch/useNavigate) rather than
  // through props.
  const search = useSearch({ from: "/(authed)/manage_/iqc/" })

  const iqcsQuery = useQuery({
    ...iqcsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
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
          <IqcTable
            rows={iqcsQuery.data.data}
            pagination={iqcsQuery.data.pagination}
            isPending={iqcsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

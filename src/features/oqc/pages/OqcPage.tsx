import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { oqcsQueryOptions } from "@/features/oqc/api/options"
import { OqcTable } from "@/features/oqc/components/OqcTable"
import { OqcTableFilter } from "@/features/oqc/components/OqcTableFilter"

// No stat cards — unlike IQC, the backend has no GET /oqc/stats, so the content area doesn't
// reserve the extra ~6rem IqcPage's Surface does.
export function OqcPage() {
  const search = useSearch({ from: "/(authed)/manage_/oqc/" })

  const oqcsQuery = useQuery({
    ...oqcsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
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
          <OqcTable
            rows={oqcsQuery.data.data}
            pagination={oqcsQuery.data.pagination}
            isPending={oqcsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

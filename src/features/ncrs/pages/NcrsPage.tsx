import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { ncrsQueryOptions } from "@/features/ncrs/api/options"
import { NcrsTable } from "@/features/ncrs/components/sections/NcrsTable"
import { NcrsTableFilter } from "@/features/ncrs/components/sections/NcrsTableFilter"

export function NcrsPage() {
  const search = useSearch({ from: "/(authed)/manage_/ncrs/" })

  const ncrsQuery = useQuery({
    ...ncrsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <NcrsTableFilter />

        {ncrsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : ncrsQuery.isError ? (
          <TableQueryError
            error={ncrsQuery.error.message}
            onRetry={() => void ncrsQuery.refetch()}
          />
        ) : (
          <NcrsTable
            ncrs={ncrsQuery.data.data}
            pagination={ncrsQuery.data.pagination}
            isPending={ncrsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

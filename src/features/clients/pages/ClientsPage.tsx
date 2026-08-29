import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { ClientsTable } from "@/features/clients/components/ClientsTable"
import { ClientsTableFilter } from "@/features/clients/components/ClientsTableFilter"
import { clientsQueryOptions } from "@/features/clients/api/options"

export function ClientsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate)
  // rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/clients/" })

  const clientsQuery = useQuery({
    ...clientsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <ClientsTableFilter />

        {clientsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : clientsQuery.isError ? (
          <TableQueryError
            error={clientsQuery.error.message}
            onRetry={() => void clientsQuery.refetch()}
          />
        ) : (
          <ClientsTable
            rows={clientsQuery.data.data}
            pagination={clientsQuery.data.pagination}
            isPending={clientsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}

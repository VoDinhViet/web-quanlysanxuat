import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryFallback } from "@/components/shared/TableQueryFallback"
import { ClientsTable } from "@/features/clients/components/ClientsTable"
import { ClientsTableFilter } from "@/features/clients/components/ClientsTableFilter"
import {
  clientGroupOptionsQueryOptions,
  clientsQueryOptions,
} from "@/features/clients/api/clients.options"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

export function ClientsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries; the reference list resolves synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/clients" })
  const navigate = useNavigate({ from: "/manage/clients" })

  const clientsQuery = useQuery({
    ...clientsQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { data: clientGroupOptions } = useSuspenseQuery(
    clientGroupOptionsQueryOptions()
  )

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<ClientsSearchSchema>,
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
        title="Danh sách khách hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Khách hàng" },
          { label: "Danh sách khách hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <ClientsTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            clientGroupOptions={clientGroupOptions}
          />

          {clientsQuery.isPending ? (
            <TableQueryFallback status="pending" />
          ) : clientsQuery.isError ? (
            <TableQueryFallback
              status="error"
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
    </main>
  )
}

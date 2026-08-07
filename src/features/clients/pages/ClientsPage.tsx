import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { DataTable } from "@/components/shared/DataTable"
import { clientColumns } from "@/features/clients/components/ClientsTableColumns"
import { ClientsTableFilter } from "@/features/clients/components/ClientsTableFilter"
import { clientsQueryOptions } from "@/features/clients/api/options"

export function ClientsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate)
  // rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/clients" })

  const clientsQuery = useQuery({
    ...clientsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

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
          <ClientsTableFilter />

          {clientsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : clientsQuery.isError ? (
            <TableQueryError
              error={clientsQuery.error.message}
              onRetry={() => void clientsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={clientsQuery.data.data}
              columns={clientColumns}
              pagination={clientsQuery.data.pagination}
              isPending={clientsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={UserRound}
                  title="Chưa có khách hàng nào"
                  description="Bắt đầu bằng cách thêm khách hàng đầu tiên vào danh sách của bạn."
                  action={
                    <PermissionGate permission="clients:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/clients/create">
                          <Plus className="size-4" />
                          Tạo khách hàng
                        </Link>
                      </Button>
                    </PermissionGate>
                  }
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

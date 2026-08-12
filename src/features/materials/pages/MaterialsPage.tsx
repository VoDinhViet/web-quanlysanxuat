import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { DataTable } from "@/components/shared/DataTable"
import { materialColumns } from "@/features/materials/components/MaterialsTableColumns"
import { MaterialsTableFilter } from "@/features/materials/components/MaterialsTableFilter"
import { materialsQueryOptions } from "@/features/materials/api/options"

export function MaterialsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/materials" })

  const materialsQuery = useQuery({
    ...materialsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh mục vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <MaterialsTableFilter />

          {materialsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : materialsQuery.isError ? (
            <TableQueryError
              error={materialsQuery.error.message}
              onRetry={() => void materialsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={materialsQuery.data.data}
              columns={materialColumns}
              pagination={materialsQuery.data.pagination}
              isPending={materialsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={PackageOpen}
                  title="Chưa có vật tư nào"
                  description="Bắt đầu bằng cách thêm vật tư đầu tiên vào danh mục của bạn."
                  action={
                    <PermissionGate permission="items:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/materials/create">
                          <Plus className="size-4" />
                          Thêm vật tư
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

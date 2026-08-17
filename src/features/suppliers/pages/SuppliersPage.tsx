import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { SupplierStatCards } from "@/features/suppliers/components/SupplierStatCards"
import { supplierColumns } from "@/features/suppliers/components/SuppliersTableColumns"
import { SuppliersTableFilter } from "@/features/suppliers/components/SuppliersTableFilter"
import { suppliersQueryOptions } from "@/features/suppliers/api/options"

export function SuppliersPage() {
  // useSearch keys off the file-based route id. The loader prefetches this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. Supplier stats are
  // non-critical — SupplierStatCards reads and awaits them itself. The filter
  // reads/writes this same route search itself (its own useSearch/useNavigate)
  // rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/suppliers" })

  const suppliersQuery = useQuery({
    ...suppliersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhà cung cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <SupplierStatCards />

        <Surface contentClassName="min-h-[calc(100svh-19rem)]">
          <SuppliersTableFilter />

          {suppliersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : suppliersQuery.isError ? (
            <TableQueryError
              error={suppliersQuery.error.message}
              onRetry={() => void suppliersQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={suppliersQuery.data.data}
              columns={supplierColumns}
              pagination={suppliersQuery.data.pagination}
              isPending={suppliersQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={Building2}
                  title="Chưa có nhà cung cấp nào"
                  description="Bắt đầu bằng cách thêm nhà cung cấp đầu tiên vào danh sách của bạn."
                  action={
                    <PermissionGate permission="suppliers:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/suppliers/create">
                          <Plus className="size-4" />
                          Thêm nhà cung cấp
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

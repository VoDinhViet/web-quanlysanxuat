import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { productColumns } from "@/features/products/components/ProductsTableColumns"
import { ProductsTableFilter } from "@/features/products/components/ProductsTableFilter"
import { itemsQueryOptions } from "@/features/products/api/options"

export function ProductsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery (not useSuspenseQuery) so filter/pagination
  // changes only update the table, not the whole route. The filter reads/
  // writes this same route search itself (its own useSearch/useNavigate) and
  // fetches its own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/products" })

  const productsQuery = useQuery({
    ...itemsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Sản phẩm (Dữ liệu nguồn)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản phẩm" },
          { label: "Danh sách sản phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <ProductsTableFilter />

          {productsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productsQuery.isError ? (
            <TableQueryError
              error={productsQuery.error.message}
              onRetry={() => void productsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={productsQuery.data.data}
              columns={productColumns}
              pagination={productsQuery.data.pagination}
              isPending={productsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={PackageOpen}
                  title="Chưa có sản phẩm nào"
                  description="Bắt đầu bằng cách thêm sản phẩm đầu tiên vào danh mục của bạn."
                  action={
                    <PermissionGate permission="items:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/products/create">
                          <Plus className="size-4" />
                          Thêm sản phẩm
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

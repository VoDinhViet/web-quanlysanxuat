import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { DataTable } from "@/components/shared/data/DataTable"
import { productionOrdersQueryOptions } from "@/features/production-orders/api/options"
import { ProductionOrdersEmptyState } from "@/features/production-orders/components/ProductionOrdersEmptyState"
import { productionOrderColumns } from "@/features/production-orders/components/ProductionOrdersTableColumns"
import { ProductionOrdersTableFilter } from "@/features/production-orders/components/ProductionOrdersTableFilter"

export function ProductionOrdersPage() {
  // useSearch keys off the file-based route id. The filter reads/writes this
  // same route search itself (its own useSearch/useNavigate) rather than
  // through props, same as OrdersTableFilter.
  const search = useSearch({ from: "/(authed)/manage_/production-orders" })

  const productionOrdersQuery = useQuery({
    ...productionOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Lệnh sản xuất (LSX)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Danh sách LSX" },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <ProductionOrdersTableFilter />

          {productionOrdersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productionOrdersQuery.isError ? (
            <TableQueryError
              error={productionOrdersQuery.error.message}
              onRetry={() => void productionOrdersQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={productionOrdersQuery.data.data}
              columns={productionOrderColumns}
              pagination={productionOrdersQuery.data.pagination}
              isPending={productionOrdersQuery.isFetching}
              emptyState={<ProductionOrdersEmptyState status={search.status} />}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

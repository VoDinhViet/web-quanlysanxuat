import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { productionOrdersQueryOptions } from "@/features/production-orders/api/options"
import { ProductionOrdersTable } from "@/features/production-orders/components/ProductionOrdersTable"
import { ProductionOrdersTableFilter } from "@/features/production-orders/components/ProductionOrdersTableFilter"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

export function ProductionOrdersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ, same as OrdersPage.
  const search = useSearch({ from: "/(authed)/manage_/production-orders" })
  const navigate = useNavigate({ from: "/manage/production-orders" })

  const productionOrdersQuery = useQuery({
    ...productionOrdersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the select, the date pickers) stay on push so Back undoes
  // them one by one.
  const handleFilterChange = (
    patch: Partial<ProductionOrdersSearchSchema>,
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
        title="Lệnh sản xuất (LSX)"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Danh sách LSX" },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <ProductionOrdersTableFilter
            search={search}
            onFilterChange={handleFilterChange}
          />

          {productionOrdersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productionOrdersQuery.isError ? (
            <TableQueryError
              error={productionOrdersQuery.error.message}
              onRetry={() => void productionOrdersQuery.refetch()}
            />
          ) : (
            <ProductionOrdersTable
              rows={productionOrdersQuery.data.data}
              pagination={productionOrdersQuery.data.pagination}
              isPending={productionOrdersQuery.isFetching}
              status={search.status}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

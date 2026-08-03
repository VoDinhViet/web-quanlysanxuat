import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { ProductsTable } from "@/features/products/components/ProductsTable"
import { ProductsTableFilter } from "@/features/products/components/ProductsTableFilter"
import {
  productGroupOptionsQueryOptions,
  productsQueryOptions,
} from "@/features/products/api/options"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { clientOptionsQueryOptions } from "@/features/clients/api"

export function ProductsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries; the reference lists resolve synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/products" })
  const navigate = useNavigate({ from: "/manage/products" })

  const productsQuery = useQuery({
    ...productsQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )
  const { data: clientOptions } = useSuspenseQuery(
    clientOptionsQueryOptions("")
  )

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<ProductsSearchSchema>,
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
          <ProductsTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            productGroupOptions={productGroupOptions}
            clientOptions={clientOptions}
          />

          {productsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : productsQuery.isError ? (
            <TableQueryError
              error={productsQuery.error.message}
              onRetry={() => void productsQuery.refetch()}
            />
          ) : (
            <ProductsTable
              rows={productsQuery.data.data}
              pagination={productsQuery.data.pagination}
              isPending={productsQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

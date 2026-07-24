import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { ProductsTable } from "@/features/products/components/ProductsTable"
import { ProductsTableFilter } from "@/features/products/components/ProductsTableFilter"
import { clientOptionsQueryOptions } from "@/features/products/queries/client-options.query"
import { productGroupOptionsQueryOptions } from "@/features/products/queries/product-group-options.query"
import { productsQueryOptions } from "@/features/products/queries/products.query"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

export function ProductsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries, so useSuspenseQuery resolves synchronously.
  const search = useSearch({ from: "/(authed)/manage_/products" })
  const navigate = useNavigate({ from: "/manage/products" })

  const { data: products } = useSuspenseQuery(productsQueryOptions(search))
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )
  const { data: clientOptions } = useSuspenseQuery(
    clientOptionsQueryOptions("")
  )

  const isFiltered = Boolean(
    search.q || search.status || search.clientId || search.productGroupId
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
        <section className="overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-foreground/6">
          <div className="flex min-h-[calc(100svh-13rem)] min-w-0 flex-col">
            <ProductsTableFilter
              search={search}
              onFilterChange={handleFilterChange}
              productGroupOptions={productGroupOptions}
              clientOptions={clientOptions}
            />

            <ProductsTable
              rows={products.data}
              pagination={products.pagination}
              isFiltered={isFiltered}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

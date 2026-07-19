import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { ProductStatCards } from "@/features/products/components/ProductStatCards"
import { ProductsTable } from "@/features/products/components/ProductsTable"
import { ProductsTableFilter } from "@/features/products/components/ProductsTableFilter"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

export function ProductsPage() {
  // useSearch/useLoaderData key off the file-based route id; useNavigate's `from`
  // keys off the resolved URL path instead — the two intentionally differ.
  const search = useSearch({ from: "/(authed)/manage_/products" })
  const result = useLoaderData({ from: "/(authed)/manage_/products" })
  const navigate = useNavigate({ from: "/manage/products" })

  const { products, stats, productGroupOptions, clientOptions } = result

  const isFiltered = Boolean(
    search.q || search.status || search.clientId || search.productGroupId
  )

  const handleFilterChange = (patch: Partial<ProductsSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
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
        <ProductStatCards stats={stats} />

        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-foreground/6">
          <div className="flex min-h-[calc(100svh-22rem)] min-w-0 flex-col">
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

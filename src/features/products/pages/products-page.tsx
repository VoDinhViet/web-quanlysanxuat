import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/page-title-bar"
import { ProductsTable } from "@/features/products/components/products-table"
import { ProductsTableFilter } from "@/features/products/components/products-table-filter"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

export function ProductsPage() {
  // useSearch/useLoaderData key off the file-based route id; useNavigate's `from`
  // keys off the resolved URL path instead — the two intentionally differ.
  const search = useSearch({ from: "/(authed)/manage_/products" })
  const result = useLoaderData({ from: "/(authed)/manage_/products" })
  const navigate = useNavigate({ from: "/manage/products" })

  const { products, productGroupOptions } = result

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

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-8.5rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <ProductsTableFilter
                search={search}
                onFilterChange={handleFilterChange}
                productGroupOptions={productGroupOptions}
              />

              <ProductsTable
                rows={products.data}
                pagination={products.pagination}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

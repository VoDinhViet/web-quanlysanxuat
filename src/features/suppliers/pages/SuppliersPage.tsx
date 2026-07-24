import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { SupplierStatCards } from "@/features/suppliers/components/SupplierStatCards"
import { SuppliersTable } from "@/features/suppliers/components/SuppliersTable"
import { SuppliersTableFilter } from "@/features/suppliers/components/SuppliersTableFilter"
import {
  countryOptionsQueryOptions,
  supplierGroupOptionsQueryOptions,
  supplierStatsQueryOptions,
  suppliersQueryOptions,
} from "@/features/suppliers/suppliers.query"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"

export function SuppliersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries, so useSuspenseQuery resolves synchronously.
  const search = useSearch({ from: "/(authed)/manage_/suppliers" })
  const navigate = useNavigate({ from: "/manage/suppliers" })

  const { data: suppliers } = useSuspenseQuery(suppliersQueryOptions(search))
  const { data: stats } = useSuspenseQuery(supplierStatsQueryOptions())
  const { data: supplierGroupOptions } = useSuspenseQuery(
    supplierGroupOptionsQueryOptions()
  )
  const { data: countryOptions } = useSuspenseQuery(
    countryOptionsQueryOptions()
  )

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<SuppliersSearchSchema>,
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
        title="Quản lý nhà cung cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <SupplierStatCards stats={stats} />

        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <div className="grid min-h-[calc(100svh-19rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <SuppliersTableFilter
                search={search}
                onFilterChange={handleFilterChange}
                supplierGroupOptions={supplierGroupOptions}
                countryOptions={countryOptions}
              />

              <SuppliersTable
                rows={suppliers.data}
                pagination={suppliers.pagination}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

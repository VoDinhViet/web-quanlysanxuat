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
import { SupplierStatCards } from "@/features/suppliers/components/SupplierStatCards"
import { SuppliersTable } from "@/features/suppliers/components/SuppliersTable"
import { SuppliersTableFilter } from "@/features/suppliers/components/SuppliersTableFilter"
import {
  supplierGroupOptionsQueryOptions,
  suppliersQueryOptions,
} from "@/features/suppliers/api/suppliers.options"
import { countryOptionsQueryOptions } from "@/features/countries/api"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"

export function SuppliersPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetches these queries; the reference lists resolve synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route. Supplier
  // stats are non-critical — SupplierStatCards reads and awaits them itself.
  const search = useSearch({ from: "/(authed)/manage_/suppliers" })
  const navigate = useNavigate({ from: "/manage/suppliers" })

  const suppliersQuery = useQuery({
    ...suppliersQueryOptions(search),
    placeholderData: keepPreviousData,
  })
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
        <SupplierStatCards />

        <Surface contentClassName="min-h-[calc(100svh-19rem)]">
          <SuppliersTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            supplierGroupOptions={supplierGroupOptions}
            countryOptions={countryOptions}
          />

          {suppliersQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : suppliersQuery.isError ? (
            <TableQueryError
              error={suppliersQuery.error.message}
              onRetry={() => void suppliersQuery.refetch()}
            />
          ) : (
            <SuppliersTable
              rows={suppliersQuery.data.data}
              pagination={suppliersQuery.data.pagination}
              isPending={suppliersQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

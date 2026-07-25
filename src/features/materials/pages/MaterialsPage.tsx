import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { TableQueryFallback } from "@/components/shared/TableQueryFallback"
import { MaterialsTable } from "@/features/materials/components/MaterialsTable"
import { MaterialsTableFilter } from "@/features/materials/components/MaterialsTableFilter"
import {
  clientOptionsQueryOptions,
  materialGroupOptionsQueryOptions,
  materialsQueryOptions,
} from "@/features/materials/materials.query"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"

export function MaterialsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries; the reference lists resolve synchronously via
  // useSuspenseQuery, while the filtered list is a plain useQuery so filter/
  // pagination changes only update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/materials" })
  const navigate = useNavigate({ from: "/manage/materials" })

  const materialsQuery = useQuery({
    ...materialsQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const { data: materialGroupOptions } = useSuspenseQuery(
    materialGroupOptionsQueryOptions()
  )
  const { data: clientOptions } = useSuspenseQuery(
    clientOptionsQueryOptions("")
  )

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<MaterialsSearchSchema>,
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
        title="Danh mục vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-foreground/6">
          <div className="flex min-h-[calc(100svh-13rem)] min-w-0 flex-col">
            <MaterialsTableFilter
              search={search}
              onFilterChange={handleFilterChange}
              materialGroupOptions={materialGroupOptions}
              clientOptions={clientOptions}
            />

            {materialsQuery.isPending ? (
              <TableQueryFallback status="pending" />
            ) : materialsQuery.isError ? (
              <TableQueryFallback
                status="error"
                error={materialsQuery.error.message}
                onRetry={() => void materialsQuery.refetch()}
              />
            ) : (
              <MaterialsTable
                rows={materialsQuery.data.data}
                pagination={materialsQuery.data.pagination}
                isPending={materialsQuery.isFetching}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

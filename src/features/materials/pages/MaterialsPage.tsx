import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
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
  // prefetched these queries, so useSuspenseQuery resolves synchronously.
  const search = useSearch({ from: "/(authed)/manage_/materials" })
  const navigate = useNavigate({ from: "/manage/materials" })

  const { data: materials } = useSuspenseQuery(materialsQueryOptions(search))
  const { data: materialGroupOptions } = useSuspenseQuery(
    materialGroupOptionsQueryOptions()
  )
  const { data: clientOptions } = useSuspenseQuery(
    clientOptionsQueryOptions("")
  )

  const isFiltered = Boolean(
    search.q ||
    search.type ||
    search.materialGroupId ||
    search.clientId ||
    search.status
  )

  const handleFilterChange = (patch: Partial<MaterialsSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
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

            <MaterialsTable
              rows={materials.data}
              pagination={materials.pagination}
              isFiltered={isFiltered}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

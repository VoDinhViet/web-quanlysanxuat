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
import { InventoryMaterialsTable } from "@/features/inventory-materials/components/InventoryMaterialsTable"
import { InventoryMaterialsTableFilter } from "@/features/inventory-materials/components/InventoryMaterialsTableFilter"
import { inventoryMaterialsQueryOptions } from "@/features/inventory-materials/api/options/inventory-materials.options"
import { materialGroupOptionsQueryOptions } from "@/features/materials/api/options"
import type { InventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"

export function InventoryMaterialsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path. The loader prefetched the list + group options; the list is
  // read via useQuery so filter/pagination changes only update the table (not the
  // whole route), while the reference list resolves synchronously via
  // useSuspenseQuery.
  const search = useSearch({
    from: "/(authed)/manage_/inventory-materials",
  })
  const navigate = useNavigate({ from: "/manage/inventory-materials" })

  const inventoryQuery = useQuery({
    ...inventoryMaterialsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  const { data: materialGroupOptions } = useSuspenseQuery(
    materialGroupOptionsQueryOptions()
  )

  // `replace` is for the search box: debounced keystrokes push many entries
  // into history very fast; using replace keeps Back usable. Discrete filter
  // changes (selects) use push so Back undoes them one by one.
  const handleFilterChange = (
    patch: Partial<InventoryMaterialsSearchSchema>,
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
        title="Tồn kho vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Tồn kho vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <InventoryMaterialsTableFilter
            search={search}
            onFilterChange={handleFilterChange}
            materialGroupOptions={materialGroupOptions}
          />

          {inventoryQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : inventoryQuery.isError ? (
            <TableQueryError
              error={inventoryQuery.error.message}
              onRetry={() => void inventoryQuery.refetch()}
            />
          ) : (
            <InventoryMaterialsTable
              rows={inventoryQuery.data.data}
              pagination={inventoryQuery.data.pagination}
              isPending={inventoryQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}

import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { AddCircle, CloseCircle, Magnifer } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { itemCategoriesQueryOptions } from "@/features/item-categories/api/options"
import { CreateItemCategoryDialog } from "@/features/item-categories/components/composites/CreateItemCategoryDialog"
import { ItemCategoriesTable } from "@/features/item-categories/components/sections/ItemCategoriesTable"

export function ItemCategoriesPage() {
  const search = useSearch({
    from: "/(authed)/manage_/settings/item-categories",
  })
  const navigate = useNavigate({ from: "/manage/settings/item-categories" })

  const [q, setQ] = useState(search.q ?? "")

  // `replace` so every debounced keystroke doesn't bury the pre-search page under history entries.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
      }),
      replace: true,
    })
  }, 300)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the user just cleared.
    handleSearch.cancel()
    setQ("")
    void navigate({ search: {}, replace: true })
  }

  const itemCategoriesQuery = useQuery(itemCategoriesQueryOptions(search))

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
        <div className="relative w-full sm:w-64">
          <Input
            aria-label="Tìm nhóm vật tư"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm kiếm mã, tên nhóm vật tư..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              handleSearch(event.target.value)
            }}
          />
          <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {search.q !== undefined && (
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            <CloseCircle className="size-4" />
            Xóa lọc
          </Button>
        )}

        <div className="ml-auto">
          <PermissionGate permission="items:create">
            <CreateItemCategoryDialog
              trigger={
                <Button className="shrink-0 text-xs">
                  <AddCircle className="size-4" />
                  Thêm nhóm vật tư
                </Button>
              }
            />
          </PermissionGate>
        </div>
      </div>

      {itemCategoriesQuery.isPending ? (
        <TableQueryLoading rows={5} />
      ) : itemCategoriesQuery.isError ? (
        <TableQueryError
          error={itemCategoriesQuery.error.message}
          onRetry={() => void itemCategoriesQuery.refetch()}
        />
      ) : (
        <ItemCategoriesTable
          itemCategories={itemCategoriesQuery.data}
          isPending={itemCategoriesQuery.isFetching}
          hasFilter={search.q !== undefined}
        />
      )}
    </div>
  )
}

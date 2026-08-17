import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"

type ProductMaterialsTableFilterProps = {
  q: string | undefined
  onSearchChange: (q: string | undefined) => void
}

export function ProductMaterialsTableFilter({
  q,
  onSearchChange,
}: ProductMaterialsTableFilterProps) {
  const [value, setValue] = useState(q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same delay as
  // the other list filters in this app.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange(trimmed.length > 0 ? trimmed : undefined)
  }, 300)

  return (
    <div className="bg-card px-4 py-4 lg:px-5">
      <div className="max-w-sm space-y-1.5">
        <FilterLabel label="Tìm kiếm" htmlFor="product-materials-search" />
        <div className="relative">
          <Input
            id="product-materials-search"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm kiếm theo mã, tên vật tư..."
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              handleSearch(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleSearch.flush()
              }
            }}
          />
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

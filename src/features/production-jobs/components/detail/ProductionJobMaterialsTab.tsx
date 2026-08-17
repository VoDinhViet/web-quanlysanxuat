import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { ProductionJobMaterialsTable } from "@/features/production-jobs/components/detail/ProductionJobMaterialsTable"
import { productionJobMaterialsQueryOptions } from "@/features/production-jobs/api/options"

const defaultPage = 1
const defaultLimit = 10

type ProductionJobMaterialsTabProps = {
  productionJobId: string
}

// "BOM vật tư" tab — vật tư cần cho Job này, đọc trực tiếp GET /production-jobs/:jobId/materials
// (phân trang), cùng pattern client-driven useQuery với ProductMaterialsTab.tsx. Các cột đọc
// thẳng snapshot text trên `production_job_materials` (materialCode/materialName/unitCode/
// unitName), độc lập materials/units sống. Cột "Tiến độ xuất kho" của bản mock cũ (badge + phân
// số + thanh tiến độ) dựa vào `issuedQty` — trường này không có trên endpoint thật (không có
// liên kết xuất kho), nên hiện MissingFieldValue thay vì bịa số.
export function ProductionJobMaterialsTab({
  productionJobId,
}: ProductionJobMaterialsTabProps) {
  const search = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const page = search.page ?? defaultPage
  const limit = search.limit ?? defaultLimit

  const materialsQuery = useQuery({
    ...productionJobMaterialsQueryOptions(productionJobId, {
      page,
      limit,
      q: search.q,
    }),
    placeholderData: keepPreviousData,
  })

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: defaultPage }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductionJobMaterialsFilter
        q={search.q}
        onSearchChange={handleSearchChange}
      />

      {materialsQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : materialsQuery.isError ? (
        <TableQueryError
          error={materialsQuery.error.message}
          onRetry={() => void materialsQuery.refetch()}
        />
      ) : (
        <ProductionJobMaterialsTable
          rows={materialsQuery.data.data}
          pagination={materialsQuery.data.pagination}
          page={page}
          limit={limit}
        />
      )}
    </div>
  )
}

type ProductionJobMaterialsFilterProps = {
  q: string | undefined
  onSearchChange: (q: string | undefined) => void
}

function ProductionJobMaterialsFilter({
  q,
  onSearchChange,
}: ProductionJobMaterialsFilterProps) {
  const [value, setValue] = useState(q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same delay as
  // the other list filters in this app.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange(trimmed.length > 0 ? trimmed : undefined)
  }, 300)

  return (
    <div className="bg-card px-4 py-4 lg:px-5">
      <label className="block max-w-sm space-y-1.5">
        <span className="sr-only">Tìm kiếm vật tư</span>
        <div className="relative">
          <Input
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
      </label>
    </div>
  )
}

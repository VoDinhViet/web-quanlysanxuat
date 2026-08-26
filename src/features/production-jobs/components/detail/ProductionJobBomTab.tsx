import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { ProductionJobBomTable } from "@/features/production-jobs/components/detail/ProductionJobBomTable"
import { productionJobBomQueryOptions } from "@/features/production-jobs/api/options"

type ProductionJobBomTabProps = {
  productionJobId: string
}

// Tab "BOM" — vật tư cần cho Job này, đọc trực tiếp GET /production-jobs/:jobId/bom
// (phân trang, cùng route tên "bom" nhưng trả bảng nhu cầu vật tư đã gộp, không phải cây BOM —
// xem doc comment ProductionJobIssue), cùng pattern client-driven useQuery với
// ProductIssuesTab.tsx. Các cột đọc thẳng snapshot text lồng trong `item`/`unit`
// (item.code/item.name/unit.name), độc lập materials/units sống. Không còn "Định mức" (`unitQty`)
// hay "Tiến độ xuất kho" (`issuedQty`) — cả hai không có trên DTO thật, không bịa số.
export function ProductionJobBomTab({
  productionJobId,
}: ProductionJobBomTabProps) {
  const search = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const page = search.page ?? 1
  const limit = search.limit ?? 10

  const bomQuery = useQuery({
    ...productionJobBomQueryOptions(productionJobId, {
      page,
      limit,
      q: search.q,
    }),
    placeholderData: keepPreviousData,
  })

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: 1 }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductionJobBomFilter
        q={search.q}
        onSearchChange={handleSearchChange}
      />

      {bomQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : bomQuery.isError ? (
        <TableQueryError
          error={bomQuery.error.message}
          onRetry={() => void bomQuery.refetch()}
        />
      ) : (
        <ProductionJobBomTable
          rows={bomQuery.data.data}
          pagination={bomQuery.data.pagination}
        />
      )}
    </div>
  )
}

type ProductionJobBomFilterProps = {
  q: string | undefined
  onSearchChange: (q: string | undefined) => void
}

// "Thêm vật tư" ở đây, "Sửa"/"Xoá" theo từng dòng trong ProductionJobBomTable — cả ba đều
// DisabledAction: `production_job_issues` chỉ có đúng một đường ghi (transaction duyệt LSX),
// chưa có route thêm/sửa/xoá độc lập nào (xem docs/domains/production.md, Invariants). Giữ chỗ
// nút cho tới khi backend mở route, cùng idiom "chưa được xây dựng" các nơi khác trong app.
function ProductionJobBomFilter({
  q,
  onSearchChange,
}: ProductionJobBomFilterProps) {
  const [value, setValue] = useState(q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same delay as
  // the other list filters in this app.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange(trimmed.length > 0 ? trimmed : undefined)
  }, 300)

  return (
    <div className="flex items-center justify-between gap-3 bg-card px-4 py-4 lg:px-5">
      <label className="block max-w-sm flex-1 space-y-1.5">
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

      <DisabledAction label="Thêm vật tư" hint="chưa được xây dựng">
        <Plus className="size-3.5" />
      </DisabledAction>
    </div>
  )
}

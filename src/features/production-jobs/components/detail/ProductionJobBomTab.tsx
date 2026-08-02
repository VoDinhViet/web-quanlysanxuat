import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MissingFieldValue } from "@/components/shared/MissingFieldValue"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { TablePagination } from "@/components/shared/TablePagination"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { productionJobMaterialsQueryOptions } from "@/features/production-jobs/api/production-jobs.options"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const COLUMN_COUNT = 7

type ProductionJobBomTabProps = {
  productionJobId: string
}

// "BOM vật tư" tab — vật tư cần cho Job này, đọc trực tiếp GET /production-jobs/:jobId/materials
// (phân trang), cùng pattern client-driven useQuery với ProductMaterialsTab.tsx. Cột "Tiến độ
// xuất kho" của bản mock cũ (badge + phân số + thanh tiến độ) dựa vào `issuedQty` — trường này
// không có trên endpoint thật (không có liên kết xuất kho), nên hiện MissingFieldValue thay vì
// bịa số.
export function ProductionJobBomTab({
  productionJobId,
}: ProductionJobBomTabProps) {
  const search = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const page = search.page ?? DEFAULT_PAGE
  const limit = search.limit ?? DEFAULT_LIMIT

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
      search: (prev) => ({ ...prev, q, page: DEFAULT_PAGE }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <MaterialsSearchFilter q={search.q} onSearchChange={handleSearchChange} />

      {materialsQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : materialsQuery.isError ? (
        <TableQueryError
          error={materialsQuery.error.message}
          onRetry={() => void materialsQuery.refetch()}
        />
      ) : (
        <div className="px-4 pb-4 lg:px-5">
          <Table>
            <TableHeader>
              <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
                <TableHead className="w-14 font-bold text-foreground">
                  STT
                </TableHead>
                <TableHead className="w-32 font-bold text-foreground">
                  Mã vật tư
                </TableHead>
                <TableHead className="min-w-44 font-bold text-foreground">
                  Tên vật tư
                </TableHead>
                <TableHead className="w-24 font-bold text-foreground">
                  ĐVT
                </TableHead>
                <TableHead className="w-24 text-center font-bold text-foreground">
                  Định mức
                </TableHead>
                <TableHead className="w-24 text-center font-bold text-foreground">
                  SL cần
                </TableHead>
                <TableHead className="min-w-48 font-bold text-foreground">
                  Tiến độ xuất kho
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialsQuery.data.data.length === 0 ? (
                <TableEmptyRow colSpan={COLUMN_COUNT} />
              ) : (
                materialsQuery.data.data.map((material, index) => (
                  <TableRow
                    key={material.materialId}
                    className="bg-card hover:bg-muted/20"
                  >
                    <TableCell className="py-3 font-mono text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="py-3 font-mono font-semibold text-foreground">
                      {material.code}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-foreground">
                      {material.name}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {material.unit.name}
                    </TableCell>
                    <TableCell className="py-3 text-center text-foreground tabular-nums">
                      {material.unitQty !== null
                        ? quantityFormatter.format(material.unitQty)
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-center text-foreground tabular-nums">
                      {quantityFormatter.format(material.requiredQty)}
                    </TableCell>
                    <TableCell className="py-3">
                      <MissingFieldValue label="Chưa có API xuất kho" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            pagination={materialsQuery.data.pagination}
            className="pt-4"
          />
        </div>
      )}
    </div>
  )
}

type MaterialsSearchFilterProps = {
  q: string | undefined
  onSearchChange: (q: string | undefined) => void
}

function MaterialsSearchFilter({
  q,
  onSearchChange,
}: MaterialsSearchFilterProps) {
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

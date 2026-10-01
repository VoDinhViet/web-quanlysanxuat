import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { BoxMinimalistic, Magnifier } from "@solar-icons/react"
import { useDebounceValue } from "usehooks-ts"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildProductionJobItemPickerColumns } from "@/features/production-jobs/components/composites/ProductionJobItemPickerColumns"
import type { ProductionJobItemPickerRow } from "@/features/production-jobs/components/composites/ProductionJobItemPickerColumns"
import { directsQueryOptions } from "@/features/directs/api"

// Dialog table, not a page: 6 rows keeps the dialog short; no page-size selector (Pagination hides
// it when `onPageSizeChange` is omitted).
const PAGE_SIZE = 6

type ProductionJobItemPickerTableProps = {
  disabled: boolean
  pickedIds: Set<string>
  onToggleRow: (row: ProductionJobItemPickerRow) => void
  // Applies `checked` to every row of the page being viewed — the parent owns the picked state.
  onToggleAllRows: (
    rows: ProductionJobItemPickerRow[],
    checked: boolean
  ) => void
}

// Step 1 (pick items) — searchable, paginated, multi-select table. The selection lives in
// CreateProductionJobIssuesDialog (`pickedIds`), so step 2 edits the same source.
export function ProductionJobItemPickerTable({
  disabled,
  pickedIds,
  onToggleRow,
  onToggleAllRows,
}: ProductionJobItemPickerTableProps) {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  const query = useQuery({
    ...directsQueryOptions({
      page,
      limit: PAGE_SIZE,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const rows: ProductionJobItemPickerRow[] = useMemo(
    () => query.data?.data ?? [],
    [query.data]
  )
  const pagination = query.data?.pagination
  const allChecked =
    rows.length > 0 && rows.every((row) => pickedIds.has(row.id))

  const columns = useMemo(
    () =>
      buildProductionJobItemPickerColumns({
        pickedIds,
        disabled,
        allChecked,
        onToggleRow,
        onToggleAll: (checked) => onToggleAllRows(rows, checked),
      }),
    [pickedIds, disabled, allChecked, onToggleRow, onToggleAllRows, rows]
  )
  const table = useTable({ data: rows, columns, features: appTableFeatures })

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Input
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder="Tìm theo mã hoặc tên..."
          value={q}
          disabled={disabled}
          onChange={(event) => {
            setQ(event.target.value)
            setPage(1)
          }}
        />
        <Magnifier className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Danh sách vật tư">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableEmpty
                    icon={BoxMinimalistic}
                    colSpan={columns.length}
                    title={
                      query.isPending ? "Đang tải..." : "Không tìm thấy kết quả"
                    }
                    description={
                      query.isPending
                        ? undefined
                        : "Thử một từ khoá khác hoặc kiểm tra lại chính tả."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.limit}
          total={pagination.totalRecords}
          onPageChange={setPage}
          disabled={disabled}
        />
      )}
    </div>
  )
}

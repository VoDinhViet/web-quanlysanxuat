import { useState } from "react"
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
import { buildConsumablePickerColumns } from "@/features/products/components/composites/ConsumablePickerColumns"
import { consumablesQueryOptions } from "@/features/consumables/api"
import type {
  ConsumablePickerRow,
  PickedConsumableValue,
} from "@/features/products/components/composites/ConsumablePickerColumns"
import type { PageSize } from "@/components/shared/composites/Pagination"

export type PickedConsumableSubmission = {
  itemId: string
  quantity: string
  note: string
}

function toSubmission(
  picked: Map<string, PickedConsumableValue>
): PickedConsumableSubmission[] {
  return Array.from(picked, ([itemId, value]) => ({ itemId, ...value }))
}

type ConsumablesPickerTableProps = {
  disabled: boolean
  // Gọi mỗi lần `picked` đổi (chọn/bỏ chọn, sửa số lượng/ghi chú) — ngay trong handler, không
  // qua effect, để CreateConsumableForm (nơi giữ nút Thêm ở footer, ngoài component này) luôn có
  // sẵn danh sách mới nhất tại thời điểm submit.
  onPickedChange: (values: PickedConsumableSubmission[]) => void
}

// Bảng vật tư tìm-kiếm-được, phân trang, chọn nhiều (checkbox) — Số lượng/Ghi chú nhập ngay tại
// dòng đã chọn. Chỉ còn picker vật tư (CONSUMABLE): node COMPONENT không còn trỏ item nào, người dùng nhập
// thẳng code/name trên form (docs/decisions/wip-removal.md). Tự giữ state `picked` (khoá theo id,
// sống qua đổi trang/tìm kiếm) và chỉ báo lên CreateConsumableForm giá trị cuối cùng để submit —
// hiển thị (ảnh/mã/tên các dòng đã chọn) là việc riêng của bảng này.
export function ConsumablesPickerTable({
  disabled,
  onPickedChange,
}: ConsumablesPickerTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)
  const [picked, setPicked] = useState<Map<string, PickedConsumableValue>>(
    new Map()
  )

  const query = useQuery({
    ...consumablesQueryOptions({
      page,
      limit: pageSize,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const rows: ConsumablePickerRow[] = query.data?.data ?? []
  const pagination = query.data?.pagination

  function commit(next: Map<string, PickedConsumableValue>) {
    setPicked(next)
    onPickedChange(toSubmission(next))
  }

  function toggleRow(row: ConsumablePickerRow) {
    const next = new Map(picked)
    if (next.has(row.id)) {
      next.delete(row.id)
    } else {
      next.set(row.id, { quantity: "1", note: "" })
    }
    commit(next)
  }

  function toggleAll(checked: boolean) {
    const next = new Map(picked)
    rows.forEach((row) => {
      if (checked) {
        if (!next.has(row.id)) next.set(row.id, { quantity: "1", note: "" })
      } else {
        next.delete(row.id)
      }
    })
    commit(next)
  }

  function updateQuantity(id: string, quantity: string) {
    const current = picked.get(id)
    if (!current) return
    const next = new Map(picked)
    next.set(id, { ...current, quantity })
    commit(next)
  }

  function updateNote(id: string, note: string) {
    const current = picked.get(id)
    if (!current) return
    const next = new Map(picked)
    next.set(id, { ...current, note })
    commit(next)
  }

  const allChecked = rows.length > 0 && rows.every((row) => picked.has(row.id))

  const columns = buildConsumablePickerColumns({
    picked,
    disabled,
    allChecked,
    onToggleRow: toggleRow,
    onToggleAll: toggleAll,
    onQuantityChange: updateQuantity,
    onNoteChange: updateNote,
  })
  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
  })

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
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
        <span className="shrink-0 text-xs font-medium text-primary">
          Đã chọn {picked.size} vật tư
        </span>
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
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
          }}
          disabled={disabled}
        />
      )}
    </div>
  )
}

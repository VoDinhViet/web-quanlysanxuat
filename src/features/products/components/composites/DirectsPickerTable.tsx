import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { BoxMinimalistic, Magnifier } from "@solar-icons/react"
import { Plus } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/shared/composites/Pagination"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildDirectPickerColumns } from "@/features/products/components/composites/DirectPickerColumns"
import { directsQueryOptions } from "@/features/directs/api"
import type { DirectPickerRow } from "@/features/products/components/composites/DirectPickerColumns"

// Chỉ 6 dòng/trang — đây là bảng trong dialog, không phải trang riêng, giữ dialog gọn theo
// chiều cao thay vì cuộn dài; không có selector đổi cỡ trang (Pagination ẩn selector khi bỏ qua
// `onPageSizeChange`) vì 6 là cố định cho ngữ cảnh này.
const PAGE_SIZE = 6

type DirectsPickerTableProps = {
  disabled: boolean
  pickedIds: Set<string>
  onToggleRow: (row: DirectPickerRow) => void
  // Chọn/bỏ chọn cả trang hiện tại cùng lúc — bảng tự biết `rows` của trang đang xem, cha chỉ cần
  // áp `checked` cho đúng các dòng đó vào state `picked` của mình.
  onToggleAllRows: (rows: DirectPickerRow[], checked: boolean) => void
}

// Bước 1 (chọn vật tư) — bảng tìm-kiếm-được, phân trang, chọn nhiều (checkbox). Số lượng/Ghi chú
// chuyển sang bước 2 (CreateDirectDetailsTable) từ khi dialog "Thêm vật tư" tách 2 bước. Lựa
// chọn (`pickedIds`) được điều khiển từ CreateDirectDialog.tsx (không tự giữ state) — bước 2
// cũng sửa được cùng state đó (bỏ chọn tại dòng), 2 bước phải cùng nhìn vào một nguồn. Số lượng đã
// chọn hiện ở badge trên tab "② Số lượng & ghi chú" (CreateDirectStepsTabs.tsx), không lặp lại
// ở đây nữa.
export function DirectsPickerTable({
  disabled,
  pickedIds,
  onToggleRow,
  onToggleAllRows,
}: DirectsPickerTableProps) {
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

  const rows: DirectPickerRow[] = query.data?.data ?? []
  const pagination = query.data?.pagination

  const allChecked =
    rows.length > 0 && rows.every((row) => pickedIds.has(row.id))

  const columns = buildDirectPickerColumns({
    pickedIds,
    disabled,
    allChecked,
    onToggleRow,
    onToggleAll: (checked) => onToggleAllRows(rows, checked),
  })
  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
  })

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
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
        {/* Mở tab mới để không mất lựa chọn đang dở trong dialog. */}
        <RoutePermissionGate route="/manage/directs/create">
          <LinkButton
            to="/manage/directs/create"
            target="_blank"
            className="text-xs"
          >
            <Plus className="size-4" />
            Thêm vật tư
          </LinkButton>
        </RoutePermissionGate>
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

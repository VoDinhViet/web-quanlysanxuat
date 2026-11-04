import { flexRender, useTable } from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"

import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildHeldRequisitionsColumns,
  heldQuantityFormatter,
} from "@/features/inventory-directs/components/composites/HeldRequisitionsTableColumns"
import { appTableFeatures } from "@/lib/table-features"
import type { HeldRequisitionsResult } from "@/lib/types/held-requisition.type"
import type { Unit } from "@/lib/types/unit.type"
import { cn } from "@/lib/utils"

type HeldRequisitionsTableProps = {
  heldRequisitions: HeldRequisitionsResult
  unit: Unit
  isFetching: boolean
  hasFilters: boolean
  onPageChange: (page: number) => void
}

// Bảng "Chi tiết số lượng đã giữ". Dòng TỔNG CỘNG lấy `totalQuantity` của backend (toàn bộ kết
// quả lọc, mọi trang), không cộng các dòng đang hiển thị.
export function HeldRequisitionsTable({
  heldRequisitions,
  unit,
  isFetching,
  hasFilters,
  onPageChange,
}: HeldRequisitionsTableProps) {
  const {
    data: heldRequisitionLines,
    pagination,
    totalQuantity,
  } = heldRequisitions
  const table = useTable({
    data: heldRequisitionLines,
    columns: buildHeldRequisitionsColumns(
      (pagination.currentPage - 1) * pagination.limit + 1
    ),
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 transition-opacity",
        isFetching && "pointer-events-none opacity-50"
      )}
    >
      {heldRequisitionLines.length === 0 ? (
        <TableEmpty
          icon={ClipboardList}
          title={
            hasFilters
              ? "Không có phiếu lĩnh phù hợp"
              : "Không có phiếu lĩnh nào đang giữ vật tư"
          }
          description={
            hasFilters
              ? "Thử đổi hoặc xóa bộ lọc để xem các phiếu khác."
              : "Phiếu lĩnh đã duyệt và chưa xuất kho sẽ hiển thị tại đây."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table
            aria-label="Danh sách phiếu lĩnh đang giữ vật tư"
            className="[&_td]:px-2 [&_th]:px-2"
          >
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-12 bg-card hover:bg-muted/25"
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
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="h-12 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="text-right text-xs font-semibold tracking-wide uppercase"
                >
                  Tổng cộng
                </TableCell>
                <TableCell className="text-right font-semibold text-primary tabular-nums">
                  {heldQuantityFormatter.format(totalQuantity)} {unit.name}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      <Pagination
        page={pagination.currentPage}
        pageSize={pagination.limit}
        total={pagination.totalRecords}
        onPageChange={onPageChange}
        className="pt-4"
      />
    </div>
  )
}

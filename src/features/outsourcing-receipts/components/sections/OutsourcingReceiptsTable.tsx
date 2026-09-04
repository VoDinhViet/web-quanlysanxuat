import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Upload } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { outsourcingReceiptsColumns } from "@/features/outsourcing-receipts/components/composites/OutsourcingReceiptsTableColumns"
import { cn } from "@/lib/utils"
import type { OutsourcingReceipt } from "@/lib/types/outsourcing-receipt.type"
import type { Pagination } from "@/lib/types/pagination.type"

type OutsourcingReceiptsTableProps = {
  rows: OutsourcingReceipt[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách phiếu nhận gia công ngoài (OS-IN) — tự dựng useReactTable/flexRender thay vì qua
// một khung DataTable dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function OutsourcingReceiptsTable({
  rows,
  pagination,
  isPending,
}: OutsourcingReceiptsTableProps) {
  const table = useTable({
    data: rows,
    columns: outsourcingReceiptsColumns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <TableEmpty
          icon={Upload}
          title="Chưa có phiếu nhận gia công ngoài nào"
          description="Phiếu OS-IN sẽ hiển thị tại đây sau khi được lập từ phiếu gửi gia công (OS-OUT) đã Đã xuất."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách phiếu nhận gia công ngoài">
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
            >
              {(header) => (
                <TableHead
                  id={header.id}
                  isRowHeader={header.index === 0}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )}
            </TableHeader>
            <TableBody items={table.getRowModel().rows}>
              {(row) => (
                <TableRow
                  id={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Send } from "lucide-react"

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
import { outsourcingOrdersColumns } from "@/features/outsourcing-orders/components/composites/OutsourcingOrdersTableColumns"
import { cn } from "@/lib/utils"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { Pagination } from "@/lib/types/pagination.type"

type OutsourcingOrdersTableProps = {
  rows: OutsourcingOrder[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách phiếu gia công ngoài (OS-OUT) — tự dựng useReactTable/flexRender thay vì qua một
// khung DataTable dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function OutsourcingOrdersTable({
  rows,
  pagination,
  isPending,
}: OutsourcingOrdersTableProps) {
  const table = useTable({
    data: rows,
    columns: outsourcingOrdersColumns,
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
          icon={Send}
          title="Chưa có phiếu gia công ngoài nào"
          description="Phiếu xuất đi gia công (OS-OUT) sẽ hiển thị tại đây sau khi được tạo."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách phiếu gia công ngoài">
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

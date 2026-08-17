import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Send } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { TablePagination } from "@/components/shared/data/TablePagination"
import { outsourcingOrdersColumns } from "@/features/outsourcing-orders/components/OutsourcingOrdersTableColumns"
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
  const table = useReactTable({
    data: rows,
    columns: outsourcingOrdersColumns,
    getCoreRowModel: getCoreRowModel(),
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
                >
                  {headerGroup.headers.map((header) => (
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
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

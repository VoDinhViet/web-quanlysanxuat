import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
  const table = useReactTable({
    data: rows,
    columns: outsourcingReceiptsColumns,
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
          icon={Upload}
          title="Chưa có phiếu nhận gia công ngoài nào"
          description="Phiếu OS-IN sẽ hiển thị tại đây sau khi được lập từ phiếu gửi gia công (OS-OUT) đã Đã xuất."
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

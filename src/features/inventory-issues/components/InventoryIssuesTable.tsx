import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpFromLine } from "lucide-react"

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
import { inventoryIssuesColumns } from "@/features/inventory-issues/components/InventoryIssuesTableColumns"
import { cn } from "@/lib/utils"
import type { InventoryIssue } from "@/lib/types/inventory-issue.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryIssuesTableProps = {
  rows: InventoryIssue[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách phiếu xuất kho — tự dựng useReactTable/flexRender thay vì qua một khung
// DataTable dùng chung, cùng idiom với InventoryReceiptsTable.
export function InventoryIssuesTable({
  rows,
  pagination,
  isPending,
}: InventoryIssuesTableProps) {
  const table = useReactTable({
    data: rows,
    columns: inventoryIssuesColumns,
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
          icon={ArrowUpFromLine}
          title="Chưa có phiếu xuất kho nào"
          description="Phiếu xuất kho sẽ hiển thị tại đây sau khi được lập."
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

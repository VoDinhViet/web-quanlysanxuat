import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"

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
import { inventoryProductLedgerColumns } from "@/features/inventory-products/components/detail/InventoryProductLedgerColumns"
import { cn } from "@/lib/utils"
import type { ProductLedgerEntry } from "@/lib/types/product-ledger.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryProductLedgerTableProps = {
  rows: ProductLedgerEntry[]
  pagination: Pagination
  isPending: boolean
}

// The stock-card ledger table — same useReactTable/flexRender boilerplate as
// PurchaseLedgerTable.tsx, this app's other from-scratch ledger table. Reads
// GET /api/inventory-products/:itemId/ledger (be-quanlysanxuat's ProductLedgerEntryResDto).
export function InventoryProductLedgerTable({
  rows,
  pagination,
  isPending,
}: InventoryProductLedgerTableProps) {
  const table = useReactTable({
    data: rows,
    columns: inventoryProductLedgerColumns,
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
          icon={ClipboardList}
          title="Chưa có giao dịch tồn kho nào"
          description="Lịch sử nhập/xuất của thành phẩm này sẽ hiển thị tại đây."
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

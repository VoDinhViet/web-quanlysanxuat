import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
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
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { inventoryProductLedgerColumns } from "@/features/inventory-products/components/composites/InventoryProductLedgerColumns"
import { cn } from "@/lib/utils"
import type { ProductLedgerEntry } from "@/lib/types/product-ledger.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type InventoryProductLedgerTableProps = {
  rows: ProductLedgerEntry[]
  pagination: PaginationMeta
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
  const table = useTable({
    data: rows,
    columns: inventoryProductLedgerColumns,
    features: appTableFeatures,
  })

  const { onPageChange, onPageSizeChange } = useRoutePagination()

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
          <Table aria-label="Danh sách giao dịch tồn kho">
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

      <Pagination
        page={pagination.currentPage}
        pageSize={pagination.limit}
        total={pagination.totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="pt-4"
      />
    </div>
  )
}

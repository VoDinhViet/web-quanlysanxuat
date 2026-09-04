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
import { purchaseLedgerColumns } from "@/features/purchase-ledger/components/composites/PurchaseLedgerTableColumns"
import { cn } from "@/lib/utils"
import { PurchaseLedgerWarning } from "@/lib/types/purchase-ledger.type"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type PurchaseLedgerTableProps = {
  rows: PurchaseLedgerRow[]
  pagination: PaginationMeta
  isPending: boolean
}

// Flags an urgent row the same way InventoryMaterialsTable flags a shortage row.
function purchaseLedgerRowClassName(
  row: PurchaseLedgerRow
): string | undefined {
  return row.warnings.includes(PurchaseLedgerWarning.URGENT)
    ? "border-l-2 border-l-destructive"
    : undefined
}

// Bảng danh mục mua hàng — tự dựng useReactTable/flexRender thay vì qua một khung DataTable dùng
// chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function PurchaseLedgerTable({
  rows,
  pagination,
  isPending,
}: PurchaseLedgerTableProps) {
  const table = useTable({
    data: rows,
    columns: purchaseLedgerColumns,
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
          title="Chưa có nhu cầu mua hàng nào"
          description="Nhu cầu mua hàng sẽ hiển thị tại đây sau khi đề xuất mua hàng được duyệt."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách nhu cầu mua hàng">
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
                  className={cn(
                    "h-14 bg-card hover:bg-muted/25",
                    purchaseLedgerRowClassName(row.original)
                  )}
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

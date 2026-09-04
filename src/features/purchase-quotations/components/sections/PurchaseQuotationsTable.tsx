import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { FileText } from "lucide-react"

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
import { purchaseQuotationsColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationsTableColumns"
import { cn } from "@/lib/utils"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"
import type { Pagination } from "@/lib/types/pagination.type"

type PurchaseQuotationsTableProps = {
  rows: PurchaseQuotationRow[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách báo giá NCC — tự dựng useReactTable/flexRender thay vì qua một khung DataTable
// dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function PurchaseQuotationsTable({
  rows,
  pagination,
  isPending,
}: PurchaseQuotationsTableProps) {
  const table = useTable({
    data: rows,
    columns: purchaseQuotationsColumns,
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
          icon={FileText}
          title="Chưa có báo giá nào"
          description="Báo giá NCC sẽ hiển thị tại đây sau khi được tạo từ đề xuất mua hàng đã duyệt."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách báo giá">
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

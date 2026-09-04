import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Undo2 } from "lucide-react"

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
import { supplierReturnsColumns } from "@/features/supplier-returns/components/composites/SupplierReturnsTableColumns"
import { cn } from "@/lib/utils"
import type { SupplierReturn } from "@/lib/types/supplier-return.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type SupplierReturnsTableProps = {
  rows: SupplierReturn[]
  pagination: PaginationMeta
  isPending: boolean
}

// Bảng danh sách phiếu trả NCC — tự dựng useReactTable/flexRender thay vì qua một khung DataTable
// dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function SupplierReturnsTable({
  rows,
  pagination,
  isPending,
}: SupplierReturnsTableProps) {
  const table = useTable({
    data: rows,
    columns: supplierReturnsColumns,
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
          icon={Undo2}
          title="Chưa có phiếu trả NCC nào"
          description="Phiếu trả sẽ hiển thị tại đây sau khi được lập từ kết quả kiểm tra chất lượng (IQC)."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách phiếu trả NCC">
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

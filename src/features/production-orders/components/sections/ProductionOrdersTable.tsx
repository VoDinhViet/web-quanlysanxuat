import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { ProductionOrdersEmptyState } from "@/features/production-orders/components/layouts/ProductionOrdersEmptyState"
import { productionOrderColumns } from "@/features/production-orders/components/composites/ProductionOrdersTableColumns"
import { cn } from "@/lib/utils"
import type {
  ProductionOrder,
  ProductionOrderStatus,
} from "@/lib/types/production-order.type"
import type { Pagination } from "@/lib/types/pagination.type"

type ProductionOrdersTableProps = {
  rows: ProductionOrder[]
  pagination: Pagination
  isPending: boolean
  // Empty-state copy depends on the active status filter — passed through rather than read via
  // useSearch, so this component doesn't get tied to one specific route.
  status: ProductionOrderStatus | undefined
}

// Bảng danh sách LSX — tự dựng useReactTable/flexRender thay vì qua một khung DataTable dùng
// chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function ProductionOrdersTable({
  rows,
  pagination,
  isPending,
  status,
}: ProductionOrdersTableProps) {
  const table = useTable({
    data: rows,
    columns: productionOrderColumns,
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
        <ProductionOrdersEmptyState status={status} />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách lệnh sản xuất">
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

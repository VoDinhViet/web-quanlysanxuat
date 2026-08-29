import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { ProductionOrdersEmptyState } from "@/features/production-orders/components/ProductionOrdersEmptyState"
import { productionOrderColumns } from "@/features/production-orders/components/ProductionOrdersTableColumns"
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
  const table = useReactTable({
    data: rows,
    columns: productionOrderColumns,
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
        <ProductionOrdersEmptyState status={status} />
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

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
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { ProductionOrdersEmptyState } from "@/features/production-orders/components/layouts/ProductionOrdersEmptyState"
import { productionOrderColumns } from "@/features/production-orders/components/composites/ProductionOrdersTableColumns"
import { cn } from "@/lib/utils"
import type {
  ProductionOrder,
  ProductionOrderStatus,
} from "@/lib/types/production-order.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type ProductionOrdersTableProps = {
  rows: ProductionOrder[]
  pagination: PaginationMeta
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

  const { onPageChange, onPageSizeChange } = useRoutePagination()

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
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
<TableRow>
{table.getFlatHeaders().map((header) => (
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
</TableHeader>
<TableBody>
{table.getRowModel().rows.map((row) => (
<TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
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

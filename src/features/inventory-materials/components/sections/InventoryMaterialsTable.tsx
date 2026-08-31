import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Warehouse } from "lucide-react"

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
import { inventoryMaterialColumns } from "@/features/inventory-materials/components/composites/InventoryMaterialsTableColumns"
import { cn } from "@/lib/utils"
import type { MaterialInventoryItem } from "@/lib/types/inventory-material.type"
import { resolveInventoryStatus } from "@/lib/types/inventory-material.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryMaterialsTableProps = {
  rows: MaterialInventoryItem[]
  pagination: Pagination
  isPending: boolean
}

// Flags shortage rows with a left accent so they stand out down the whole
// list, not just within their own row's status badge.
function inventoryRowClassName(
  item: MaterialInventoryItem
): string | undefined {
  return resolveInventoryStatus(item.available, item.minStock) === "SHORTAGE"
    ? "border-l-2 border-l-destructive"
    : undefined
}

// Bảng tồn kho vật tư — tự dựng useReactTable/flexRender thay vì qua một khung DataTable dùng
// chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function InventoryMaterialsTable({
  rows,
  pagination,
  isPending,
}: InventoryMaterialsTableProps) {
  const table = useTable({
    data: rows,
    columns: inventoryMaterialColumns,
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
          icon={Warehouse}
          title="Không có vật tư nào"
          description="Thử thay đổi bộ lọc hoặc kiểm tra lại thời gian xem tồn."
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
                  className={cn(
                    "h-14 bg-card hover:bg-muted/25",
                    inventoryRowClassName(row.original)
                  )}
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

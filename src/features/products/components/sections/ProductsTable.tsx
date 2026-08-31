import { Link } from "@tanstack/react-router"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { productColumns } from "@/features/products/components/composites/ProductsTableColumns"
import { cn } from "@/lib/utils"
import type { Item } from "@/lib/types/item.type"
import type { Pagination } from "@/lib/types/pagination.type"

type ProductsTableProps = {
  rows: Item[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách sản phẩm — tự dựng useReactTable/flexRender thay vì qua một khung DataTable dùng
// chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function ProductsTable({
  rows,
  pagination,
  isPending,
}: ProductsTableProps) {
  const table = useTable({
    data: rows,
    columns: productColumns,
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
          icon={PackageOpen}
          title="Chưa có sản phẩm nào"
          description="Bắt đầu bằng cách thêm sản phẩm đầu tiên vào danh mục của bạn."
          action={
            <RoutePermissionGate route="/manage/products/create">
              <Button asChild size="sm" className="text-xs">
                <Link to="/manage/products/create">
                  <Plus className="size-4" />
                  Thêm sản phẩm
                </Link>
              </Button>
            </RoutePermissionGate>
          }
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

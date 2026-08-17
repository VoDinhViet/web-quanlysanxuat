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
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { TablePagination } from "@/components/shared/data/TablePagination"
import { bomMaterialColumns } from "@/features/products/components/ProductMaterialsTableColumns"
import { cn } from "@/lib/utils"
import type { BomMaterial } from "@/lib/types/bom-item.type"
import type { Pagination } from "@/lib/types/pagination.type"

type ProductMaterialsTableProps = {
  rows: BomMaterial[]
  pagination: Pagination
  isPending: boolean
}

// Bảng vật tư trong cấu trúc sản phẩm (tab BOM) — tự dựng useReactTable/flexRender thay vì qua
// một khung DataTable dùng chung, để mỗi bảng tự do tiến hoá riêng.
export function ProductMaterialsTable({
  rows,
  pagination,
  isPending,
}: ProductMaterialsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: bomMaterialColumns,
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
          title="Chưa có vật tư nào"
          description='Thêm vật tư vào cấu trúc sản phẩm ở tab "Cấu trúc & Công đoạn" để hiển thị tại đây.'
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

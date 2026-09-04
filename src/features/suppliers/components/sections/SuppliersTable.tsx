import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Building2, Plus } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
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
import { supplierColumns } from "@/features/suppliers/components/composites/SuppliersTableColumns"
import { cn } from "@/lib/utils"
import type { Supplier } from "@/lib/types/supplier.type"
import type { Pagination } from "@/lib/types/pagination.type"

type SuppliersTableProps = {
  rows: Supplier[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách nhà cung cấp — tự dựng useReactTable/flexRender thay vì qua một khung DataTable
// dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function SuppliersTable({
  rows,
  pagination,
  isPending,
}: SuppliersTableProps) {
  const table = useTable({
    data: rows,
    columns: supplierColumns,
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
          icon={Building2}
          title="Chưa có nhà cung cấp nào"
          description="Bắt đầu bằng cách thêm nhà cung cấp đầu tiên vào danh sách của bạn."
          action={
            <RoutePermissionGate route="/manage/suppliers/create">
              <LinkButton
                to="/manage/suppliers/create"
                size="sm"
                className="text-xs"
              >
                <Plus className="size-4" />
                Thêm nhà cung cấp
              </LinkButton>
            </RoutePermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách nhà cung cấp">
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

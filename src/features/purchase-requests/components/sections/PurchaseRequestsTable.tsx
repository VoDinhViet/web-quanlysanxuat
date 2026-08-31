import { Link } from "@tanstack/react-router"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ClipboardList, Plus } from "lucide-react"

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
import { purchaseRequestColumns } from "@/features/purchase-requests/components/composites/PurchaseRequestsTableColumns"
import { cn } from "@/lib/utils"
import type { PurchaseRequest } from "@/lib/types/purchase-request.type"
import type { Pagination } from "@/lib/types/pagination.type"

type PurchaseRequestsTableProps = {
  rows: PurchaseRequest[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách đề xuất mua hàng — tự dựng useReactTable/flexRender thay vì qua một khung
// DataTable dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function PurchaseRequestsTable({
  rows,
  pagination,
  isPending,
}: PurchaseRequestsTableProps) {
  const table = useTable({
    data: rows,
    columns: purchaseRequestColumns,
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
          icon={ClipboardList}
          title="Chưa có đề xuất mua hàng nào"
          description="Đề xuất mua hàng sẽ hiển thị tại đây khi được tạo."
          action={
            <RoutePermissionGate route="/manage/purchase-requests/create">
              <Button asChild size="sm" className="text-xs">
                <Link to="/manage/purchase-requests/create">
                  <Plus className="size-4" />
                  Tạo đề xuất mua hàng (Manual)
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

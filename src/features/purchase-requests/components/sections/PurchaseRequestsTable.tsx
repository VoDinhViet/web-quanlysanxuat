import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ClipboardList, Plus } from "lucide-react"

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
              <LinkButton
                to="/manage/purchase-requests/create"
                size="sm"
                className="text-xs"
              >
                <Plus className="size-4" />
                Tạo đề xuất mua hàng (Manual)
              </LinkButton>
            </RoutePermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách đề xuất mua hàng">
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

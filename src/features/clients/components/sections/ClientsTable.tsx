import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Plus, UserRound } from "lucide-react"

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
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { clientColumns } from "@/features/clients/components/composites/ClientsTableColumns"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/types/client.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type ClientsTableProps = {
  rows: Client[]
  pagination: PaginationMeta
  isPending: boolean
}

// Bảng danh sách khách hàng — tự dựng useReactTable/flexRender thay vì qua một khung DataTable
// dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function ClientsTable({
  rows,
  pagination,
  isPending,
}: ClientsTableProps) {
  const table = useTable({
    data: rows,
    columns: clientColumns,
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
          icon={UserRound}
          title="Chưa có khách hàng nào"
          description="Bắt đầu bằng cách thêm khách hàng đầu tiên vào danh sách của bạn."
          action={
            <RoutePermissionGate route="/manage/clients/create">
              <LinkButton
                to="/manage/clients/create"
                size="sm"
                className="text-xs"
              >
                <Plus className="size-4" />
                Tạo khách hàng
              </LinkButton>
            </RoutePermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách khách hàng">
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

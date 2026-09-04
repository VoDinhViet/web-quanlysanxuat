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
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { userColumns } from "@/features/users/components/composites/UsersTableColumns"
import { cn } from "@/lib/utils"
import type { UserListItem } from "@/lib/types/user.type"
import type { Pagination } from "@/lib/types/pagination.type"

type UsersTableProps = {
  rows: UserListItem[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách nhân sự — tự dựng useReactTable/flexRender thay vì qua một khung DataTable dùng
// chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function UsersTable({ rows, pagination, isPending }: UsersTableProps) {
  const table = useTable({
    data: rows,
    columns: userColumns,
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
          icon={UserRound}
          title="Chưa có nhân sự nào"
          description="Bắt đầu bằng cách thêm nhân sự đầu tiên vào hệ thống."
          action={
            <RoutePermissionGate route="/manage/users/create">
              <LinkButton
                to="/manage/users/create"
                size="sm"
                className="text-xs"
              >
                <Plus className="size-4" />
                Thêm nhân sự
              </LinkButton>
            </RoutePermissionGate>
          }
        />
      ) : (
        // Bảng rộng nhất tràn màn 1440px khi mở sidebar, phải cuộn ngang bên trong card.
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách nhân sự">
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

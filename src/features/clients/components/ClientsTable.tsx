import { Link } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Plus, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { TablePagination } from "@/components/shared/data/TablePagination"
import { clientColumns } from "@/features/clients/components/ClientsTableColumns"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/types/client.type"
import type { Pagination } from "@/lib/types/pagination.type"

type ClientsTableProps = {
  rows: Client[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách khách hàng — tự dựng useReactTable/flexRender thay vì qua một khung DataTable
// dùng chung, để mỗi trang danh sách tự do tiến hoá riêng.
export function ClientsTable({
  rows,
  pagination,
  isPending,
}: ClientsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: clientColumns,
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
          icon={UserRound}
          title="Chưa có khách hàng nào"
          description="Bắt đầu bằng cách thêm khách hàng đầu tiên vào danh sách của bạn."
          action={
            <RoutePermissionGate route="/manage/clients/create">
              <Button asChild size="sm" className="text-xs">
                <Link to="/manage/clients/create">
                  <Plus className="size-4" />
                  Tạo khách hàng
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

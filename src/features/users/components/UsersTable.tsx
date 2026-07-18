import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { TablePagination } from "@/components/shared/TablePagination"
import { userColumns } from "@/features/users/components/UsersTableColumns"
import type { User } from "@/features/users/types/user.type"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

type UsersTableProps = {
  rows: User[]
  pagination: Pagination
}

export function UsersTable({ rows, pagination }: UsersTableProps) {
  const table = useReactTable({
    data: rows,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-w-0 flex-1 overflow-hidden px-4 pb-4 lg:px-5">
      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
        <Table className="text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0">
          <TableHeader className="bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-13 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-4 text-xs font-semibold text-foreground",
                      header.column.columnDef.meta?.headerClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableEmptyRow colSpan={userColumns.length} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-0 text-xs font-medium text-foreground",
                        cell.column.columnDef.meta?.cellClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

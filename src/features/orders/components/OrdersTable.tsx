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
import { TablePagination } from "@/components/shared/TablePagination"
import { OrdersEmptyState } from "@/features/orders/components/OrdersEmptyState"
import { orderColumns } from "@/features/orders/components/OrdersTableColumns"
import type { Order } from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

type OrdersTableProps = {
  rows: Order[]
  pagination: Pagination
  isFiltered: boolean
}

export function OrdersTable({
  rows,
  pagination,
  isFiltered,
}: OrdersTableProps) {
  const table = useReactTable({
    data: rows,
    columns: orderColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (rows.length === 0) {
    return (
      <div className="min-w-0 flex-1 px-4 pb-4 lg:px-5">
        <div className="rounded-md border border-dashed border-border/70 bg-card">
          <OrdersEmptyState isFiltered={isFiltered} />
        </div>

        <TablePagination pagination={pagination} className="pt-4" />
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 px-4 pb-4 lg:px-5">
      {/* `overflow-x-auto`, unlike the products table's `overflow-hidden`: 11
          columns including three wide money columns overflow a 1440px laptop
          with the sidebar open, and they must scroll inside the card. */}
      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table className="text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0">
          <TableHeader className="bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-4 text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase",
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-0 text-xs font-medium text-foreground",
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

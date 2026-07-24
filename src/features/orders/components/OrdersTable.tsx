import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouterState } from "@tanstack/react-router"

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
import { cn } from "@/lib/utils"
import type { Order } from "@/features/orders/types/order.type"
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

  // Search-as-you-type re-runs the route loader on every debounced keystroke. Dim
  // the previous rows while the next page loads instead of blanking the table —
  // the filter input above must stay mounted or the caret jumps out mid-word.
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <div className="rounded-md border border-dashed border-border/70 bg-card">
          <OrdersEmptyState isFiltered={isFiltered} />
        </div>

        <TablePagination pagination={pagination} className="pt-4" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isLoading && "pointer-events-none opacity-50"
      )}
    >
      {/* `overflow-x-auto`, unlike the products table's `overflow-hidden`: 11
          columns including three wide money columns overflow a 1440px laptop
          with the sidebar open, and they must scroll inside the card. */}
      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
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
                    className={cell.column.columnDef.meta?.cellClassName}
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

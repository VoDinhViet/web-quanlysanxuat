import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { RowData, TableOptions } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/shared/TablePagination"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

type DataTableProps<TData extends RowData> = {
  rows: TData[]
  // `TableOptions["columns"]`, không phải `ColumnDef<TData, unknown>[]`: mảng do
  // createColumnHelper dựng ra có TValue khác nhau ở từng cột, mà ColumnDef lại
  // bất biến theo TValue — chỉ chính option type của thư viện mới nhận được nó.
  columns: TableOptions<TData>["columns"]
  // Omit for a table whose full row set always renders in one response (no
  // page/limit to control) — the pagination bar just doesn't render.
  pagination?: Pagination
  isPending: boolean
  emptyState: ReactNode
  // Optional per-row accent (e.g. flagging a shortage row) — omit for the
  // default look every other table already has.
  rowClassName?: (row: TData) => string | undefined
  // Skip the side padding and the rounded/bordered/bg-card box — for a table that already sits
  // inside a section with its own edge-to-edge framing (e.g. PurchaseRequestItemsSection), where
  // DataTable's own frame would show up as a redundant, mismatched second border. `Table` already
  // provides its own `overflow-x-auto` container, so no scroll behavior is lost.
  bare?: boolean
}

// Khung chung cho mọi bảng danh sách có phân trang: feature chỉ đưa rows/columns
// và empty state của nó, phần còn lại giống hệt nhau ở cả 11 màn hình.
export function DataTable<TData extends RowData>({
  rows,
  columns,
  pagination,
  isPending,
  emptyState,
  rowClassName,
  bare,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const tableElement = (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
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
            className={cn(
              "h-14 bg-card hover:bg-muted/25",
              rowClassName?.(row.original)
            )}
          >
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
  )

  return (
    <div
      className={cn(
        "min-w-0 flex-1 pb-4 transition-opacity",
        !bare && "px-4 lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        emptyState
      ) : bare ? (
        tableElement
      ) : (
        // `overflow-x-auto`: bảng rộng nhất (11 cột, ví dụ đơn hàng) tràn màn
        // 1440px khi mở sidebar, phải cuộn ngang bên trong card.
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          {tableElement}
        </div>
      )}

      {pagination ? (
        <TablePagination pagination={pagination} className="pt-4" />
      ) : null}
    </div>
  )
}

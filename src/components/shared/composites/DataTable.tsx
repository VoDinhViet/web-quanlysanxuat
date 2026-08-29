import { flexRender } from "@tanstack/react-table"
import type { Table as TableInstance } from "@tanstack/react-table"
import type { ReactNode } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DataTableProps<TData> = {
  table: TableInstance<TData>
  isEmpty: boolean
  emptyState: ReactNode
}

// The `useReactTable`/`flexRender` shell every list table in the repo reuses — byte-identical
// across domains except the columns/data fed into `useReactTable` itself, which stay at the
// call site (see InventoryRequisitionsTable.tsx). `isEmpty`/`emptyState` cover the
// no-rows branch; the empty state's own icon/title/description text stays a caller concern —
// only the branching shell is shared.
export function DataTable<TData>({
  table,
  isEmpty,
  emptyState,
}: DataTableProps<TData>) {
  if (isEmpty) {
    return <>{emptyState}</>
  }

  return (
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
  )
}

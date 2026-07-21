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
import { MaterialsEmptyState } from "@/features/materials/components/MaterialsEmptyState"
import { materialColumns } from "@/features/materials/components/MaterialsTableColumns"
import type { Material } from "@/features/materials/types/material.type"
import type { Pagination } from "@/lib/types/pagination.type"

type MaterialsTableProps = {
  rows: Material[]
  pagination: Pagination
  isFiltered: boolean
}

export function MaterialsTable({
  rows,
  pagination,
  isFiltered,
}: MaterialsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: materialColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (rows.length === 0) {
    return (
      <div className="min-w-0 flex-1 px-4 pb-4 lg:px-5">
        <div className="rounded-md border border-dashed border-border/70 bg-card">
          <MaterialsEmptyState isFiltered={isFiltered} />
        </div>

        <TablePagination pagination={pagination} className="pt-4" />
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden px-4 pb-4 lg:px-5">
      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
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

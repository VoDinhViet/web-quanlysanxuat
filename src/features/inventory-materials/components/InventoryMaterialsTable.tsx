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
import { InventoryMaterialsEmptyState } from "@/features/inventory-materials/components/InventoryMaterialsEmptyState"
import { inventoryMaterialColumns } from "@/features/inventory-materials/components/InventoryMaterialsTableColumns"
import { cn } from "@/lib/utils"
import type { InventoryMaterial } from "@/lib/types/inventory-material.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryMaterialsTableProps = {
  rows: InventoryMaterial[]
  pagination: Pagination
  isPending: boolean
}

export function InventoryMaterialsTable({
  rows,
  pagination,
  isPending,
}: InventoryMaterialsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: inventoryMaterialColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
          isPending && "pointer-events-none opacity-50"
        )}
      >
        <InventoryMaterialsEmptyState />

        <TablePagination pagination={pagination} className="pt-4" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-w-0 flex-1 overflow-hidden px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
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

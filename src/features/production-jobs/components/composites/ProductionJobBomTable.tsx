import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { productionJobBomColumns } from "@/features/production-jobs/components/composites/ProductionJobBomTableColumns"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import type { Pagination } from "@/lib/types/pagination.type"

const columnCount = 6

type ProductionJobBomTableProps = {
  rows: ProductionJobIssue[]
  pagination: Pagination
}

export function ProductionJobBomTable({
  rows,
  pagination,
}: ProductionJobBomTableProps) {
  const table = useTable({
    data: rows,
    columns: productionJobBomColumns,
    features: appTableFeatures,
  })

  return (
    <div className="px-4 pb-4 lg:px-5">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30"
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
          {rows.length === 0 ? (
            <TableEmpty colSpan={columnCount} title="Không có dữ liệu" />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="bg-card hover:bg-muted/20">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

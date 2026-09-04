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
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { productionJobBomColumns } from "@/features/production-jobs/components/composites/ProductionJobBomTableColumns"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

const columnCount = 6

type ProductionJobBomTableProps = {
  rows: ProductionJobIssue[]
  pagination: PaginationMeta
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

  const { onPageChange, onPageSizeChange } = useRoutePagination()

  return (
    <div className="px-4 pb-4 lg:px-5">
      <Table aria-label="Danh sách vật tư đã lãnh">
        <TableHeader
          columns={table.getFlatHeaders()}
          className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30"
        >
          {(header) => (
            <TableHead
              id={header.id}
              isRowHeader={header.index === 0}
              className={header.column.columnDef.meta?.headerClassName}
            >
              {!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          )}
        </TableHeader>
        <TableBody
          items={table.getRowModel().rows}
          renderEmptyState={() => (
            <TableEmpty colSpan={columnCount} title="Không có dữ liệu" />
          )}
        >
          {(row) => (
            <TableRow
              id={row.id}
              className="bg-card hover:bg-muted/20"
              columns={row.getVisibleCells()}
            >
              {(cell) => (
                <TableCell
                  className={cell.column.columnDef.meta?.cellClassName}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        page={pagination.currentPage}
        pageSize={pagination.limit}
        total={pagination.totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="pt-4"
      />
    </div>
  )
}

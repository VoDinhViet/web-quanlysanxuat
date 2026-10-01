import { useMemo } from "react"
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
import { buildProductionJobBomColumns } from "@/features/production-jobs/components/composites/ProductionJobBomTableColumns"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type ProductionJobBomTableProps = {
  productionJobId: string
  status: ProductionJobStatus
  rows: ProductionJobIssue[]
  pagination: PaginationMeta
}

export function ProductionJobBomTable({
  productionJobId,
  status,
  rows,
  pagination,
}: ProductionJobBomTableProps) {
  const isEditable = status === ProductionJobStatus.PENDING
  const columns = useMemo(
    () => buildProductionJobBomColumns({ productionJobId, isEditable }),
    [productionJobId, isEditable]
  )
  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
  })

  const { onPageChange, onPageSizeChange } = useRoutePagination()

  return (
    <div className="px-4 pb-4 lg:px-5">
      <Table aria-label="Danh sách vật tư đã lãnh">
        <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
          <TableRow>
            {table.getFlatHeaders().map((header) => (
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
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <TableEmpty colSpan={columns.length} title="Không có dữ liệu" />
              </TableCell>
            </TableRow>
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

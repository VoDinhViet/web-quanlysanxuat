import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ClipboardList } from "lucide-react"

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
import { productionExecutionJobColumns } from "@/features/production-execution/components/composites/ProductionExecutionJobsTableColumns"
import { cn } from "@/lib/utils"
import type { ProductionJobByOperation } from "@/lib/types/production-job.type"
import type { Pagination } from "@/lib/types/pagination.type"

type ProductionExecutionJobsTableProps = {
  rows: ProductionJobByOperation[]
  pagination: Pagination
  isPending: boolean
}

// Bảng "DANH SÁCH CÔNG VIỆC" — cùng khuôn ProductionJobsTable.tsx (tự dựng useReactTable/
// flexRender, không qua khung DataTable dùng chung).
export function ProductionExecutionJobsTable({
  rows,
  pagination,
  isPending,
}: ProductionExecutionJobsTableProps) {
  const table = useTable({
    data: rows,
    columns: productionExecutionJobColumns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <TableEmpty
          icon={ClipboardList}
          title="Chưa có công việc nào"
          description="Không có Job nào khớp công đoạn và bộ lọc hiện tại."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}

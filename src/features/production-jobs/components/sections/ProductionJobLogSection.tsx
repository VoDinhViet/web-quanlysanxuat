import { useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { productionJobLogColumns } from "@/features/production-jobs/components/composites/ProductionJobLogColumns"
import { productionJobLogsQueryOptions } from "@/features/production-jobs/api/options"
import { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import type { PageSize } from "@/components/shared/composites/Pagination"

const logColumnCount = productionJobLogColumns.length

type ProductionJobLogSectionProps = {
  productionJobId: string
}

// Sub-section of "Thông tin chung" — InfoSection ở ProductionJobInfoTab.tsx đã sở hữu heading
// "Lịch sử thay đổi" + icon nên component này chỉ render bảng, không khung/heading riêng (khác
// ProductionOrderLogsCard.tsx). `page`/`pageSize` là state cục bộ chứ không phải search param của
// route: `page`/`limit` trên route này đã thuộc tab "Vật tư" — nên tự giữ state rồi truyền
// onPageChange/onPageSizeChange cho Pagination thay vì patch route search param, cùng khuôn
// CreateInventoryRequisitionPickerSection.tsx. useTable/flexRender với productionJobLogColumns
// (module scope, ProductionJobLogColumns.tsx) — cùng khuôn IqcTable.tsx/IqcTableColumns.tsx.
export function ProductionJobLogSection({
  productionJobId,
}: ProductionJobLogSectionProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const logsQuery = useQuery({
    ...productionJobLogsQueryOptions(productionJobId, page, pageSize),
    placeholderData: keepPreviousData,
  })

  const logs = logsQuery.data?.data ?? []
  const pagination = logsQuery.data?.pagination

  const table = useTable({
    data: logs,
    columns: productionJobLogColumns,
    features: appTableFeatures,
  })

  return (
    <div>
      <div
        className={cn(
          "overflow-x-auto transition-opacity",
          logsQuery.isFetching && "pointer-events-none opacity-50"
        )}
      >
        <Table aria-label="Lịch sử thay đổi">
          <TableHeader
            columns={table.getFlatHeaders()}
            className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
          >
            {(header) => (
              <TableHead
                id={header.id}
                isRowHeader={header.index === 0}
                className={header.column.columnDef.meta?.headerClassName}
              >
                {!header.isPlaceholder &&
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            )}
          </TableHeader>
          <TableBody
            items={table.getRowModel().rows}
            renderEmptyState={() =>
              logsQuery.isPending ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </div>
              ) : logsQuery.isError ? (
                <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                  {logsQuery.error.message}
                </div>
              ) : (
                <TableEmpty
                  colSpan={logColumnCount}
                  title="Chưa có dữ liệu lịch sử."
                />
              )
            }
          >
            {(row) => (
              <TableRow
                id={row.id}
                className="h-14 bg-card hover:bg-muted/25"
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
      </div>

      {pagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.limit}
          total={pagination.totalRecords}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
          }}
          disabled={logsQuery.isFetching}
          className="border-t border-border px-4 py-3 sm:px-5"
        />
      )}
    </div>
  )
}

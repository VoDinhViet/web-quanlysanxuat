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
import { LocalPagination } from "@/components/shared/composites/LocalPagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { productionJobLogColumns } from "@/features/production-jobs/components/composites/ProductionJobLogColumns"
import { productionJobLogsQueryOptions } from "@/features/production-jobs/api/options"
import { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"

const logColumnCount = productionJobLogColumns.length
const limitOptions = [10, 20, 50] as const

type ProductionJobLogSectionProps = {
  productionJobId: string
}

// Sub-section of "Thông tin chung" — InfoSection ở ProductionJobInfoTab.tsx đã sở hữu heading
// "Lịch sử thay đổi" + icon nên component này chỉ render bảng, không khung/heading riêng (khác
// ProductionOrderLogsCard.tsx). `page`/`limit` là state cục bộ chứ không phải search param của
// route: `page`/`limit` trên route này đã thuộc tab "Vật tư" — nên dùng `LocalPagination` (không
// phải `TablePagination`, component đó tự patch route search param), cùng khuôn
// CreateInventoryRequisitionPickerSection.tsx. useTable/flexRender với productionJobLogColumns
// (module scope, ProductionJobLogColumns.tsx) — cùng khuôn IqcTable.tsx/IqcTableColumns.tsx.
export function ProductionJobLogSection({
  productionJobId,
}: ProductionJobLogSectionProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
  const logsQuery = useQuery({
    ...productionJobLogsQueryOptions(productionJobId, page, limit),
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
            {logsQuery.isPending ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={logColumnCount}
                  className="h-40 text-center"
                >
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logsQuery.isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={logColumnCount}
                  className="h-40 text-center text-xs text-muted-foreground"
                >
                  {logsQuery.error.message}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableEmpty
                colSpan={logColumnCount}
                title="Chưa có dữ liệu lịch sử."
              />
            ) : (
              table.getRowModel().rows.map((row) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <LocalPagination
          pagination={pagination}
          limitOptions={limitOptions}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit as (typeof limitOptions)[number])
            setPage(1)
          }}
          disabled={logsQuery.isFetching}
          className="border-t border-border px-4 py-3 sm:px-5"
        />
      )}
    </div>
  )
}

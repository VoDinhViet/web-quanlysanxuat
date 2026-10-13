import { flexRender, useTable } from "@tanstack/react-table"
import { ShieldAlert } from "lucide-react"

import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ncrColumns } from "@/features/ncrs/components/composites/NcrsTableColumns"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import type { Ncr } from "@/lib/types/ncr.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type NcrsTableProps = {
  ncrs: Ncr[]
  pagination: PaginationMeta
  isPending: boolean
}

export function NcrsTable({ ncrs, pagination, isPending }: NcrsTableProps) {
  const table = useTable({
    data: ncrs,
    columns: ncrColumns,
    features: appTableFeatures,
  })

  const { onPageChange, onPageSizeChange } = useRoutePagination()

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {ncrs.length === 0 ? (
        <TableEmpty
          icon={ShieldAlert}
          title="Chưa có phiếu NCR nào"
          description="NCR được sinh tự động khi OQC sàng lọc có hàng NG, hoặc tạo tay cho lỗi nội bộ / khách hàng phản hồi."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách NCR">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
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

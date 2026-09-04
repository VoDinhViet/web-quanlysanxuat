import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ClipboardMinus } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { inventoryRequisitionsColumns } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionsTableColumns"
import { cn } from "@/lib/utils"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type InventoryRequisitionsTableProps = {
  rows: InventoryRequisition[]
  pagination: PaginationMeta
  isPending: boolean
}

// Bảng danh sách phiếu lãnh vật tư — tự dựng useReactTable/flexRender, cùng idiom
// InventoryIssuesTable.
export function InventoryRequisitionsTable({
  rows,
  pagination,
  isPending,
}: InventoryRequisitionsTableProps) {
  const table = useTable({
    data: rows,
    columns: inventoryRequisitionsColumns,
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
      {rows.length === 0 ? (
        <TableEmpty
          icon={ClipboardMinus}
          title="Chưa có phiếu lãnh vật tư nào"
          description="Phiếu lãnh vật tư sẽ hiển thị tại đây sau khi được lập."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách phiếu lãnh vật tư">
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
            <TableBody items={table.getRowModel().rows}>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
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

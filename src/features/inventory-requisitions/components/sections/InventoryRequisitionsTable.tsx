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
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { inventoryRequisitionsColumns } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionsTableColumns"
import { cn } from "@/lib/utils"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryRequisitionsTableProps = {
  rows: InventoryRequisition[]
  pagination: Pagination
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

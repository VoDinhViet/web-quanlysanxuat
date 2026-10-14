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
import { purchaseQuotationAllocationsColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationAllocationsColumns"
import { cn } from "@/lib/utils"
import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationAllocationsTableProps = {
  item: PurchaseQuotationItemDetail
}

export function PurchaseQuotationAllocationsTable({
  item,
}: PurchaseQuotationAllocationsTableProps) {
  const table = useTable({
    data: item.allocations,
    columns: purchaseQuotationAllocationsColumns,
    features: appTableFeatures,
  })

  return (
    <div className="overflow-x-auto">
      <Table aria-label="Danh sách dòng ĐXMH" className="min-w-full">
        <TableHeader className="bg-transparent [&>tr]:h-8 [&>tr]:bg-transparent [&>tr]:hover:bg-transparent">
          <TableRow>
            {table.getFlatHeaders().map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "border-b border-primary/15 text-xs font-medium text-muted-foreground",
                  header.column.columnDef.meta?.headerClassName
                )}
              >
                {!header.isPlaceholder &&
                  flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={purchaseQuotationAllocationsColumns.length}
                className="py-3 text-center text-xs text-muted-foreground"
              >
                Chưa có dòng đề xuất mua hàng nào cho vật tư này
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="h-10 transition-colors hover:bg-muted/15"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "border-b border-primary/15 py-1.5 text-xs",
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

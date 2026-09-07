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

// Read-only twin of PurchaseQuotationSupplierCompareTable.tsx's shell (same compact h-8 header,
// border-b border-primary/15 cells) — the two stack under the same outer row in
// PurchaseQuotationDetailQuotesSection.tsx, one listing the vật tư's NCC quotes, this one listing
// the ĐXMH lines merged into it.
export function PurchaseQuotationAllocationsTable({
  item,
}: PurchaseQuotationAllocationsTableProps) {
  const table = useTable({
    data: item.allocations,
    columns: purchaseQuotationAllocationsColumns,
    features: appTableFeatures,
  })

  return (
    <Table aria-label="Danh sách dòng ĐXMH">
      <TableHeader className="bg-transparent [&>tr]:h-8 [&>tr]:bg-transparent [&>tr]:hover:bg-transparent">
        <TableRow>
          {table.getFlatHeaders().map((header) => (
            <TableHead
              key={header.id}
              className={cn(
                "border-b border-primary/15",
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
            <TableCell colSpan={purchaseQuotationAllocationsColumns.length}>
              {/* Nested sub-row hint, indented under the outer item row — same "too small-scale
                  for TableEmpty" treatment as QuotationCompareQuoteTable.tsx /
                  PurchaseQuotationSupplierCompareTable.tsx, this table's twin stacked right
                  below it. */}
              <div className="flex h-11 items-center pl-10">
                <span className="text-xs text-muted-foreground">
                  Chưa có dòng ĐXMH nào cho vật tư này
                </span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="h-11 bg-transparent hover:bg-transparent"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "border-b border-primary/15",
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
  )
}

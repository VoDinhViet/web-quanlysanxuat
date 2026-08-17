import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { purchaseQuotationAllocationsColumns } from "@/features/purchase-quotations/components/detail/PurchaseQuotationAllocationsColumns"
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
  const table = useReactTable({
    data: item.allocations,
    columns: purchaseQuotationAllocationsColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader className="bg-transparent">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="h-8 bg-transparent hover:bg-transparent"
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "border-b border-primary/15",
                  header.column.columnDef.meta?.headerClassName
                )}
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
        ))}

        {/* Nested sub-row hint, indented under the outer item row — same "too small-scale for
        TableEmpty" treatment as QuotationCompareQuoteTable.tsx / PurchaseQuotationSupplierCompareTable.tsx,
        this table's twin stacked right below it. */}
        {item.allocations.length === 0 && (
          <TableRow className="h-11 border-none bg-transparent hover:bg-transparent">
            <TableCell
              colSpan={purchaseQuotationAllocationsColumns.length}
              className="pl-10"
            >
              <span className="text-xs text-muted-foreground">
                Chưa có dòng ĐXMH nào cho vật tư này
              </span>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

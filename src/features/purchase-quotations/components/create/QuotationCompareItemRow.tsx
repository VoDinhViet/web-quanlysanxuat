import type { AnyFieldApi } from "@tanstack/react-form"
import { flexRender } from "@tanstack/react-table"
import type { Row } from "@tanstack/react-table"

import { TableCell, TableRow } from "@/components/ui/table"
import { QuotationCompareQuoteTable } from "@/features/purchase-quotations/components/create/QuotationCompareQuoteTable"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationCompareItemRowProps = {
  row: Row<PickedQuotationItemValue>
  itemsField: AnyFieldApi
  disabled?: boolean
}

// One item's row in the outer table, followed by its own nested QuotationCompareQuoteTable
// listing THIS item's NCC × giá — each item manages its own supplier list independently (adding a
// supplier to item A never touches item B), matching the reference two-level table layout.
export function QuotationCompareItemRow({
  row,
  itemsField,
  disabled,
}: QuotationCompareItemRowProps) {
  return (
    <>
      <TableRow className="h-14 bg-card hover:bg-muted/25">
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cell.column.columnDef.meta?.cellClassName}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>

      {/* Left accent border reads as "detail of the row above" — same idiom
          PurchaseLedgerPage uses (border-l-2) to flag a row, reused here for hierarchy instead
          of a second dose of the outer table's own header shading. */}
      <TableRow className="border-l-2 border-l-primary/25 bg-muted/25 hover:bg-muted/25">
        <TableCell colSpan={row.getVisibleCells().length} className="p-0">
          <QuotationCompareQuoteTable
            item={row.original}
            itemIndex={row.index}
            itemsField={itemsField}
            disabled={disabled}
          />
        </TableCell>
      </TableRow>
    </>
  )
}

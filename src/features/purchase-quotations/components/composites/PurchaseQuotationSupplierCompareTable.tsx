import { useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildPurchaseQuotationSupplierCompareColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationSupplierCompareColumns"
import { cn } from "@/lib/utils"
import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationSupplierCompareTableProps = {
  item: PurchaseQuotationItemDetail
  selectable: boolean
  selectedSupplierId: string | undefined
  onSelectSupplier: (quotationItemSupplierId: string) => void
  isApproved: boolean
}

// Read-only twin of QuotationCompareQuoteTable.tsx (same nested-table shell: compact h-8
// header, border-b border-primary/15 cells). Rendered directly under every outer row — see
// PurchaseQuotationDetailQuotesSection.tsx's row map.
export function PurchaseQuotationSupplierCompareTable({
  item,
  selectable,
  selectedSupplierId,
  onSelectSupplier,
  isApproved,
}: PurchaseQuotationSupplierCompareTableProps) {
  const columns = useMemo(
    () =>
      buildPurchaseQuotationSupplierCompareColumns({ selectable, isApproved }),
    [selectable, isApproved]
  )

  const table = useTable({
    data: item.suppliers,
    columns,
    features: appTableFeatures,
  })

  const tableElement = (
    <Table aria-label="So sánh báo giá NCC">
      {item.suppliers.length > 0 && (
        <TableHeader
          columns={table.getFlatHeaders()}
          className="bg-transparent [&>tr]:h-8 [&>tr]:bg-transparent [&>tr]:hover:bg-transparent"
        >
          {(header) => (
            <TableHead
              id={header.id}
              isRowHeader={header.index === 0}
              className={cn(
                "border-b border-primary/15",
                header.column.columnDef.meta?.headerClassName
              )}
            >
              {!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          )}
        </TableHeader>
      )}
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            id={row.id}
            className={cn(
              "h-12 bg-transparent hover:bg-transparent",
              row.original.id === selectedSupplierId && "bg-primary/5"
            )}
            columns={row.getVisibleCells()}
          >
            {(cell) => (
              <TableCell
                className={cn(
                  "border-b border-primary/15",
                  cell.column.columnDef.meta?.cellClassName
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            )}
          </TableRow>
        ))}

        {/* Nested sub-row hint, indented under the outer item row — too small-scale for
        TableEmpty's icon-badge treatment, intentionally not using it here. */}
        {item.suppliers.length === 0 && (
          <TableRow
            id="empty"
            key="empty"
            className="h-11 border-none bg-transparent hover:bg-transparent"
          >
            <TableCell colSpan={columns.length} className="pl-10">
              <span className="text-xs text-muted-foreground">
                Chưa có NCC nào cho vật tư này
              </span>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  // `RadioGroup`'s Root only needs to exist somewhere above every RadioGroupItem in the React
  // tree — div > table is valid HTML, so wrapping the whole table (not just tbody) sidesteps
  // radio-group.tsx's own `grid w-full gap-3` styling: `contents` makes the wrapper participate
  // in layout as if it weren't there, leaving the table's own layout untouched.
  return selectable ? (
    // `value={selectedSupplierId ?? ""}` keeps this always controlled — passing `undefined`
    // before a supplier is picked would flip Radix from "controlled" to "uncontrolled" on the
    // first selection and trigger React's dev warning; "" never matches a real id, so it
    // renders exactly like "nothing selected" would.
    <RadioGroup
      value={selectedSupplierId ?? ""}
      onChange={onSelectSupplier}
      className="contents"
    >
      {tableElement}
    </RadioGroup>
  ) : (
    tableElement
  )
}

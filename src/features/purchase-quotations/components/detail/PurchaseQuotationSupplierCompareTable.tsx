import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildPurchaseQuotationSupplierCompareColumns } from "@/features/purchase-quotations/components/detail/PurchaseQuotationSupplierCompareColumns"
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

  const table = useReactTable({
    data: item.suppliers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const tableElement = (
    <Table>
      {item.suppliers.length > 0 && (
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
      )}
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className={cn(
              "h-12 bg-transparent hover:bg-transparent",
              row.original.id === selectedSupplierId && "bg-primary/5"
            )}
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

        {/* Nested sub-row hint, indented under the outer item row — too small-scale for
        TableEmpty's icon-badge treatment, intentionally not using it here. */}
        {item.suppliers.length === 0 && (
          <TableRow className="h-11 border-none bg-transparent hover:bg-transparent">
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
      onValueChange={onSelectSupplier}
      className="contents"
    >
      {tableElement}
    </RadioGroup>
  ) : (
    tableElement
  )
}

import { useMemo } from "react"
import type { AnyFieldApi } from "@tanstack/react-form"
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
import { buildQuotationSuppliersQuoteColumns } from "@/features/purchase-quotations/components/composites/CreateQuotationSuppliersQuoteColumns"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationCompareQuoteTableProps = {
  item: PickedQuotationItemValue
  itemIndex: number
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Nested useReactTable listing one item's own NCC × giá rows. The "Thêm NCC" trigger that opens
// QuotationAddSupplierDialog now lives on the outer row's "Thao tác" cell (see
// CreateQuotationSuppliersItemColumns.tsx) instead of a trailing row here — this table only
// renders an empty-state hint when the item has no suppliers yet. Rendered directly under every
// outer row (see CreateQuotationSuppliersSection.tsx's row map) — one instance per item, so
// calling useMemo/useReactTable here at the top level is a normal single-hook-per-render
// component, no conditional-mount reasoning needed.
export function QuotationCompareQuoteTable({
  item,
  itemIndex,
  itemsField,
  disabled,
}: QuotationCompareQuoteTableProps) {
  const quoteColumns = useMemo(
    () =>
      buildQuotationSuppliersQuoteColumns({
        itemsField,
        itemIndex,
        item,
        disabled,
      }),
    [itemsField, itemIndex, item, disabled]
  )

  const quoteTable = useReactTable({
    data: item.suppliers,
    columns: quoteColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      {item.suppliers.length > 0 && (
        <TableHeader className="bg-transparent">
          {quoteTable.getHeaderGroups().map((headerGroup) => (
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
        {quoteTable.getRowModel().rows.map((quoteRow) => (
          <TableRow
            key={quoteRow.id}
            className="h-12 bg-transparent hover:bg-transparent"
          >
            {quoteRow.getVisibleCells().map((cell) => (
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
            <TableCell colSpan={quoteColumns.length} className="pl-10">
              <span className="text-xs text-muted-foreground">
                Chưa có NCC nào cho vật tư này
              </span>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

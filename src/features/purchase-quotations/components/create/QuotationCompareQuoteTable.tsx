import { useMemo } from "react"
import type { AnyFieldApi } from "@tanstack/react-form"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildQuotationSuppliersQuoteColumns } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersQuoteColumns"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationCompareQuoteTableProps = {
  item: PickedQuotationItemValue
  itemIndex: number
  itemsField: AnyFieldApi
  onOpenAddSupplier: (purchaseRequestItemId: string) => void
  disabled?: boolean
}

// Nested useReactTable listing one item's own NCC × giá rows, plus a trailing "Thêm NCC" trigger
// that opens QuotationAddSupplierDialog (owned by CreateQuotationSuppliersSection — supplier
// search now lives once in that dialog, not per item here). Rendered directly under every outer
// row (see CreateQuotationSuppliersSection.tsx's row map) — one instance per item, so calling
// useMemo/useReactTable here at the top level is a normal single-hook-per-render component, no
// conditional-mount reasoning needed.
export function QuotationCompareQuoteTable({
  item,
  itemIndex,
  itemsField,
  onOpenAddSupplier,
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
    data: item.quotes,
    columns: quoteColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      {item.quotes.length > 0 && (
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

        <TableRow className="h-11 border-none bg-transparent hover:bg-transparent">
          <TableCell colSpan={quoteColumns.length} className="pl-10">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary"
                disabled={disabled}
                onClick={() => onOpenAddSupplier(item.purchaseRequestItemId)}
              >
                <Plus className="size-3.5" />
                Thêm NCC
              </Button>
              {item.quotes.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Chưa có NCC nào cho vật tư này
                </span>
              )}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

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
import { ComboboxField } from "@/components/shared/ComboboxField"
import { buildQuotationSuppliersQuoteColumns } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersQuoteColumns"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationCompareQuoteTableProps = {
  item: PickedQuotationItemValue
  itemIndex: number
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Nested useReactTable listing one item's own NCC × giá rows, plus the trailing "+ Thêm NCC" add
// row. Owns its own supplier-options fetch (search box is per item, not shared across the whole
// compare grid) — split out of QuotationCompareItemRow so that component only has to worry about
// the outer row, not this table's columns/add-row markup too.
export function QuotationCompareQuoteTable({
  item,
  itemIndex,
  itemsField,
  disabled,
}: QuotationCompareQuoteTableProps) {
  const {
    suppliers,
    options: supplierOptions,
    isFetching: isSupplierOptionsPending,
    onSearchChange: onSupplierSearchChange,
  } = useGetSupplierOptions()

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

  const chosenIds = new Set(item.quotes.map((quote) => quote.supplierId))
  const availableOptions = supplierOptions.filter(
    (option) => !chosenIds.has(option.value)
  )

  return (
    <Table>
      <TableHeader>
        {quoteTable.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="h-8 border-none bg-transparent hover:bg-transparent"
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
        {quoteTable.getRowModel().rows.map((quoteRow) => (
          <TableRow
            key={quoteRow.id}
            className="h-12 border-none bg-transparent hover:bg-background/60"
          >
            {quoteRow.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cell.column.columnDef.meta?.cellClassName}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}

        {/* Same column rhythm as the data rows above (not a wide spanning banner) — only the
            "Nhà cung cấp" cell is live, the rest stay blank so the add slot reads as the start of
            a new row rather than a separate control bolted onto the table. */}
        <TableRow className="h-11 border-none bg-transparent hover:bg-transparent">
          <TableCell className="pl-10">
            <ComboboxField
              className="h-8 max-w-56 border-dashed bg-transparent text-xs text-muted-foreground"
              placeholder="+ Thêm NCC"
              value={undefined}
              onValueChange={(nextId) => {
                if (!nextId) return
                const picked = suppliers.find(
                  (supplier) => supplier.id === nextId
                )
                itemsField.replaceValue(itemIndex, {
                  ...item,
                  quotes: [
                    ...item.quotes,
                    {
                      supplierId: nextId,
                      supplierLabel: picked?.name ?? "",
                      lastPrice: "",
                      lastPurchaseDate: "",
                      unitPrice: "",
                      leadTimeDays: "",
                      note: "",
                    },
                  ],
                })
              }}
              options={availableOptions}
              onSearchChange={onSupplierSearchChange}
              isPending={isSupplierOptionsPending}
              emptyMessage="Không tìm thấy NCC"
              disabled={disabled}
            />
          </TableCell>
          {quoteColumns.slice(1).map((_, index) => (
            <TableCell key={index} />
          ))}
        </TableRow>
      </TableBody>
    </Table>
  )
}

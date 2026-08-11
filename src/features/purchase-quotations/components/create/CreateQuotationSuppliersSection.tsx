import { Fragment, useMemo } from "react"
import { useField } from "@tanstack/react-form"
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
import { buildQuotationSuppliersItemColumns } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersItemColumns"
import { QuotationAddSupplierDialog } from "@/features/purchase-quotations/components/create/QuotationAddSupplierDialog"
import { QuotationCompareQuoteTable } from "@/features/purchase-quotations/components/create/QuotationCompareQuoteTable"
import { useQuotationAddSupplierDialog } from "@/features/purchase-quotations/hooks/use-quotation-add-supplier-dialog"
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"

export const CreateQuotationSuppliersSection = withForm({
  defaultValues: createQuotationFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const addSupplierDialog = useQuotationAddSupplierDialog(itemsField, items)

    const columns = useMemo(
      () =>
        buildQuotationSuppliersItemColumns({
          itemsField,
          disabled,
          onOpenAddSupplier: addSupplierDialog.openForItem,
        }),
      [itemsField, disabled, addSupplierDialog.openForItem]
    )

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const suppliedCount = items.filter(
      (item) => item.suppliers.length > 0
    ).length

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Khai báo NCC & báo giá
            </h2>
            <p className="text-sm text-muted-foreground">
              Giá gần nhất, ngày mua và lý do điều chỉnh SL chỉ để tham khảo,
              không lưu khi tạo RFQ
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {suppliedCount}/{items.length} vật tư đã có NCC
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-11 hover:bg-muted/45"
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
                <Fragment key={row.original.purchaseRequestItemId}>
                  <TableRow className="h-14 bg-card hover:bg-muted/25">
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

                  {/* Left accent reads as "detail of the row above" — reads unmistakably at a
                      glance which vật tư a NCC block belongs to, even with several items stacked.
                      An inset ring rather than `border-l`: Tailwind's `ring-*` has no single-side
                      variant (it's always a uniform box-shadow), so this is that same inset
                      box-shadow mechanism hand-scoped to just the left edge via an arbitrary
                      value — drawn inside the cell's own bounds (no layout width added, unlike
                      border-l) and never clipped by the outer wrapper's `overflow-hidden`. Set on
                      the <td>, not the <tr> — a border-collapse:separate table (the default,
                      unset elsewhere in this app) only paints borders/shadows declared on
                      table/td/th; one set on <tr> is silently dropped. */}
                  <TableRow className="bg-card hover:bg-card">
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="p-0 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                    >
                      <QuotationCompareQuoteTable
                        item={row.original}
                        itemIndex={row.index}
                        itemsField={itemsField}
                        disabled={disabled}
                      />
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        <QuotationAddSupplierDialog
          open={addSupplierDialog.isOpen}
          onOpenChange={addSupplierDialog.setOpen}
          items={items}
          initialItemIds={addSupplierDialog.initialItemIds}
          onSubmit={addSupplierDialog.submit}
        />
      </div>
    )
  },
})

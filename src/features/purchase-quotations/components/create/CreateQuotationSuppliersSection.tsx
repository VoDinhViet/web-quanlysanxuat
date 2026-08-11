import { Fragment, useCallback, useMemo, useState } from "react"
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
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"
import type { QuotationSupplierSelection } from "@/features/purchase-quotations/components/create/QuotationAddSupplierDialog"

export const CreateQuotationSuppliersSection = withForm({
  defaultValues: createQuotationFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const [addSupplierOpen, setAddSupplierOpen] = useState(false)
    // Pre-checked when the dialog opens: the one item whose own "Thêm NCC" trigger opened it —
    // still an array since the checklist itself can still target more than one item.
    const [initialItemIds, setInitialItemIds] = useState<string[]>([])

    const openAddSupplierForItem = useCallback(
      (purchaseRequestItemId: string) => {
        setInitialItemIds([purchaseRequestItemId])
        setAddSupplierOpen(true)
      },
      []
    )

    const handleAddSupplier = ({
      supplierId,
      supplierLabel,
      purchaseRequestItemIds,
    }: QuotationSupplierSelection) => {
      const targetIds = new Set(purchaseRequestItemIds)

      // One replaceValue per touched item — form-core's replaceFieldValue applies a functional
      // update against the live store, so sequential calls here each build on the previous
      // one's result rather than overwriting each other.
      items.forEach((item, index) => {
        if (!targetIds.has(item.purchaseRequestItemId)) return

        itemsField.replaceValue(index, {
          ...item,
          quotes: [
            ...item.quotes,
            {
              supplierId,
              supplierLabel,
              lastPrice: "",
              lastPurchaseDate: "",
              unitPrice: "",
              leadTimeDays: "",
              note: "",
            },
          ],
        })
      })

      setAddSupplierOpen(false)
    }

    const columns = useMemo(
      () => buildQuotationSuppliersItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const suppliedCount = items.filter((item) => item.quotes.length > 0).length

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Khai báo NCC & báo giá
            </h2>
            <p className="text-sm text-muted-foreground">
              Mỗi vật tư tự chọn NCC riêng — một vật tư có thể hỏi nhiều NCC để
              so sánh giá
            </p>
            <p className="text-[11px] text-muted-foreground/75 italic">
              Giá gần nhất, ngày mua gần nhất và lý do điều chỉnh SL chỉ để tham
              khảo — không được lưu khi tạo RFQ
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

                  {/* Left accent border reads as "detail of the row above" — same idea
                      PurchaseLedgerPage uses (border-l-2) to flag a row, reused here for
                      hierarchy instead of a second dose of the outer table's own header
                      shading. Set on the <td>, not the <tr> — a border-collapse:separate
                      table (the default, unset elsewhere in this app) only paints borders
                      declared on table/td/th; one set on <tr> is silently dropped. */}
                  <TableRow className="bg-card hover:bg-card">
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="border-l-2 border-l-primary/40 p-0"
                    >
                      <QuotationCompareQuoteTable
                        item={row.original}
                        itemIndex={row.index}
                        itemsField={itemsField}
                        onOpenAddSupplier={openAddSupplierForItem}
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
          open={addSupplierOpen}
          onOpenChange={setAddSupplierOpen}
          items={items}
          initialItemIds={initialItemIds}
          onSubmit={handleAddSupplier}
        />
      </div>
    )
  },
})

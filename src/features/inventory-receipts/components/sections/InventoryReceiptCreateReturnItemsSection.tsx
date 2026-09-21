import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
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
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildInventoryReceiptReturnItemColumns } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateReturnItemsColumns"
import { createInventoryReceiptReturnFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Bước ③ — nhập SL nhận thực tế + đơn giá (tuỳ chọn) + ghi chú cho các dòng đã chọn ở bước ②
// (InventoryReceiptCreateReturnPickerSection.tsx), cùng khuôn CreateInventoryRequisitionItemsSection.tsx.
export const InventoryReceiptCreateReturnItemsSection = withForm({
  defaultValues: createInventoryReceiptReturnFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildInventoryReceiptReturnItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    )

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Nhập số lượng
          </h2>
          <p className="text-sm text-muted-foreground">
            Nhập số lượng nhận thực tế cho từng vật tư đã chọn.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư nhận">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
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
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <TableEmpty
                      colSpan={columns.length}
                      title="Chưa chọn vật tư nào"
                      description="Quay lại bước ② để chọn vật tư."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.itemId}
                    className="h-16 bg-card hover:bg-muted/25"
                  >
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Tổng số dòng: {items.length}</span>
          <span>
            Tổng số lượng:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </span>
          </span>
        </div>
      </div>
    )
  },
})

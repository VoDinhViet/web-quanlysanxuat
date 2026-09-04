import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildCreateOutboundOrderItemColumns } from "@/features/outbound-orders/components/composites/CreateOutboundOrderItemsColumns"
import { useUnfulfilledOrderItemLookup } from "@/features/outbound-orders/hooks/use-unfulfilled-order-item-lookup"
import { createOutboundOrderFormDefaultValues } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { fulfillmentTypeLabels } from "@/lib/types/outbound-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const fulfillmentTypeOptions = buildOptionsFromLabels(fulfillmentTypeLabels)

// Bước ② — bảng nhập SL giao cho từng dòng đã chọn ở bước ①, cộng ngày giao/hình thức giao/ghi
// chú cho cả phiếu ở cuối bước (khớp cách CreateOutsourcingReceiptItemsSection.tsx gộp header
// field vào cùng bước với bảng nhập số lượng, thay vì tách tab info riêng như
// CreateOutsourcingOrderInfoSection.tsx — DO chỉ có 3 field header, không cần tab riêng). Không
// có kho xuất hàng — BE bỏ warehouseId khỏi outbound_orders.
export const CreateOutboundOrderItemsSection = withForm({
  defaultValues: createOutboundOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // `useField`, không phải `form.Field`'s render-prop — useReactTable/useMemo bên dưới là hook
    // thật, cùng lý do CreateOutboundOrderPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const lookupUnfulfilledOrderItem = useUnfulfilledOrderItemLookup()

    const columns = useMemo(
      () =>
        buildCreateOutboundOrderItemColumns({
          itemsField,
          disabled,
          lookupUnfulfilledOrderItem,
        }),
      [itemsField, disabled, lookupUnfulfilledOrderItem]
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              ② SL giao & thông tin phiếu
            </h2>
            <p className="text-sm text-muted-foreground">
              SL giao mặc định bằng SL đặt, có thể chỉnh sửa.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-destructive hover:bg-destructive/10"
              isDisabled={disabled}
              onPress={() => itemsField.setValue([])}
            >
              <Trash2 className="size-3.5" />
              Xóa tất cả dòng
            </Button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table
            aria-label="Danh sách dòng giao hàng"
            className="min-w-[900px]"
          >
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
            >
              {(header) => (
                <TableHead
                  id={header.id}
                  isRowHeader={header.index === 0}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )}
            </TableHeader>
            <TableBody
              items={table.getRowModel().rows}
              renderEmptyState={() => (
                <TableEmpty
                  colSpan={columns.length}
                  title="Chưa có dòng nào"
                  description="Quay lại bước ① để chọn PO/Job cần giao."
                />
              )}
            >
              {(row) => (
                <TableRow
                  id={row.original.orderItemId}
                  className="h-16 bg-card hover:bg-muted/25"
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Tổng số dòng: {items.length}</span>
          <span>
            Tổng SL giao:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </span>
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-3">
          <form.AppField name="fulfillmentDate">
            {(field) => (
              <field.DateField label="Ngày giao" required disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="fulfillmentType">
            {(field) => (
              <field.SelectField
                label="Hình thức giao"
                required
                placeholder="Chọn hình thức giao"
                options={fulfillmentTypeOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="deliveryAddress">
            {(field) => (
              <field.TextareaField
                label="Địa chỉ giao hàng"
                placeholder="Địa chỉ giao hàng (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="receiverName">
            {(field) => (
              <field.TextField
                label="Người nhận"
                placeholder="Tên người nhận (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="receiverPhone">
            {(field) => (
              <field.TextField
                label="Điện thoại"
                placeholder="Điện thoại người nhận (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="vehicle">
            {(field) => (
              <field.TextField
                label="Phương tiện"
                placeholder="Phương tiện (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú phiếu"
                placeholder="Ghi chú hiển thị trên phiếu (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})

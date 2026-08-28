import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { NumericFormat } from "react-number-format"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { withForm } from "@/hooks/use-app-form"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { InventoryReceiptItemFormValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import { vndFormatter } from "@/lib/currency"

// Chế độ chọn dòng từ PO đã đặt — hiện khi phiếu gắn `purchaseOrderId`
// (xem InventoryReceiptCreateItemsSection.tsx). Mỗi dòng PO là một checkbox; chọn tự tạo dòng
// phiếu với `purchaseOrderItemId` trỏ về dòng đó, mặc định SL/Đơn giá lấy từ dòng PO nhưng cho
// sửa. Cố ý KHÔNG hiển thị "đã nhận trước đó / còn lại" — BE mới tính SL nhận ở mức PO tổng,
// chưa tính theo từng dòng (`docs/domains/inventory.md`, xem plan Phần 1.4) — ghi rõ trong UI
// thay vì giả vờ có.
export const InventoryReceiptCreatePurchaseOrderItemsSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    const { data: purchaseOrder, isFetching } = useQuery({
      ...purchaseOrderQueryOptions(purchaseOrderId),
      enabled: Boolean(purchaseOrderId),
    })

    return (
      <form.Field name="items" mode="array">
        {(itemsField) => {
          const items = itemsField.state.value

          const findIndex = (purchaseOrderItemId: string) =>
            items.findIndex(
              (row) => row.purchaseOrderItemId === purchaseOrderItemId
            )

          const toggle = (
            line: NonNullable<typeof purchaseOrder>["items"][number]
          ) => {
            const index = findIndex(line.id)
            if (index >= 0) {
              itemsField.removeValue(index)
              return
            }

            const { item } = line.purchaseRequestItem
            const value: InventoryReceiptItemFormValue = {
              itemId: item.id,
              itemLabel: `${item.code} — ${item.name}`,
              itemUnit: item.unit.name,
              purchaseOrderItemId: line.id,
              quantity: line.quantity,
              unitPrice: line.unitPrice ?? undefined,
              note: "",
            }
            itemsField.pushValue(value)
          }

          const updateQuantity = (
            purchaseOrderItemId: string,
            quantity: number | undefined
          ) => {
            const index = findIndex(purchaseOrderItemId)
            if (index < 0) return
            itemsField.replaceValue(index, { ...items[index], quantity })
          }

          return (
            <div className="px-4 py-5 sm:px-5">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Dòng vật tư từ đơn mua hàng
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chọn dòng cần nhận và điều chỉnh số lượng thực nhận nếu khác
                  số lượng đặt. Chưa hiển thị số lượng đã nhận trước đó/còn lại
                  của từng dòng.
                </p>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12 hover:bg-muted/45">
                      <TableHead className="w-10" />
                      <TableHead>Vật tư</TableHead>
                      <TableHead className="text-right">SL đặt</TableHead>
                      <TableHead className="text-right">SL thực nhận</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!purchaseOrder || purchaseOrder.items.length === 0 ? (
                      <TableEmpty
                        colSpan={5}
                        title={
                          isFetching
                            ? "Đang tải dòng đơn mua hàng..."
                            : "Đơn mua hàng không có dòng nào"
                        }
                      />
                    ) : (
                      purchaseOrder.items.map((line) => {
                        const index = findIndex(line.id)
                        const isSelected = index >= 0
                        const row = isSelected ? items[index] : null
                        const { item } = line.purchaseRequestItem

                        return (
                          <TableRow
                            key={line.id}
                            className="h-14 bg-card hover:bg-muted/25"
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                disabled={disabled}
                                onCheckedChange={() => toggle(line)}
                                aria-label={`Chọn dòng ${item.code}`}
                              />
                            </TableCell>
                            <TableCell>
                              {item.code} — {item.name}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {line.quantity} {item.unit.name}
                            </TableCell>
                            <TableCell className="text-right">
                              <NumericFormat
                                customInput={Input}
                                className="ml-auto h-8 w-28 text-right text-xs"
                                value={row?.quantity ?? ""}
                                disabled={!isSelected || disabled}
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                onValueChange={(values) =>
                                  updateQuantity(line.id, values.floatValue)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {line.unitPrice !== null
                                ? vndFormatter.format(line.unitPrice)
                                : "—"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        }}
      </form.Field>
    )
  },
})

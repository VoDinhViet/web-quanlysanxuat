import { useState } from "react"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconButton } from "@/components/shared/IconButton"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { withForm } from "@/hooks/use-app-form"
import { OrderItemDialog } from "@/features/orders/components/OrderItemDialog"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { currencyFormatter } from "@/lib/currency"
import type { Currency } from "@/lib/types/order.type"
import {
  ORDER_ITEM_STATUS_LABELS,
  OrderItemStatus,
} from "@/lib/types/order.type"
import { roundMoney } from "@/lib/utils"

// Client-side estimate only, mirroring the backend's `recalculateTotals`
// formula (round(quantity * unitPrice * (1 - discountPercent/100), 2)) — the
// authoritative lineTotal comes back from the server after save.
function estimateLineTotal(item: OrderItemFormValue): number {
  const quantity = Number(item.quantity) || 0
  const unitPrice = Number(item.unitPrice) || 0
  const discountPercent = Number(item.discountPercent) || 0

  return roundMoney(quantity * unitPrice * (1 - discountPercent / 100))
}

export const UpdateOrderItemsSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    return (
      <form.Field name="items" mode="array">
        {(itemsField) => {
          const items = itemsField.state.value
          const editingItem =
            editingIndex !== null ? (items[editingIndex] ?? null) : null

          const openAdd = () => {
            setEditingIndex(null)
            setDialogOpen(true)
          }

          const openEdit = (index: number) => {
            setEditingIndex(index)
            setDialogOpen(true)
          }

          const handleSubmit = (value: OrderItemFormValue) => {
            if (editingIndex === null) {
              itemsField.pushValue(value)
            } else {
              itemsField.replaceValue(editingIndex, value)
            }
            setDialogOpen(false)
          }

          return (
            <div className="px-4 py-5 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    Danh sách sản phẩm
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng có thể lưu mà không cần dòng sản phẩm nào
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/40 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                  disabled={disabled}
                  onClick={openAdd}
                >
                  <Plus className="size-4" />
                  Thêm sản phẩm
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12 hover:bg-muted/45">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">CK (%)</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-32 text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableEmptyRow
                        colSpan={9}
                        message="Chưa có sản phẩm nào. Bấm “Thêm sản phẩm” để thêm."
                      />
                    ) : (
                      items.map((item, index) => (
                        <TableRow
                          key={index}
                          className="h-14 bg-card hover:bg-muted/25"
                        >
                          <TableCell className="text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>{item.productLabel || "—"}</TableCell>
                          <TableCell>{item.productUnit || "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {currencyFormatter.format(
                              Number(item.unitPrice) || 0
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.discountPercent}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {currencyFormatter.format(estimateLineTotal(item))}
                          </TableCell>
                          <TableCell>
                            {item.status === OrderItemStatus.CANCELLED ? (
                              <span className="text-destructive">
                                {ORDER_ITEM_STATUS_LABELS[item.status]}
                              </span>
                            ) : (
                              <span className="text-success">
                                {ORDER_ITEM_STATUS_LABELS[item.status]}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconButton
                                label={`Di chuyển lên dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                disabled={disabled || index === 0}
                                onClick={() =>
                                  itemsField.moveValue(index, index - 1)
                                }
                              >
                                <ArrowUp className="size-3.5" />
                              </IconButton>
                              <IconButton
                                label={`Di chuyển xuống dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                disabled={
                                  disabled || index === items.length - 1
                                }
                                onClick={() =>
                                  itemsField.moveValue(index, index + 1)
                                }
                              >
                                <ArrowDown className="size-3.5" />
                              </IconButton>
                              <IconButton
                                label={`Sửa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                disabled={disabled}
                                onClick={() => openEdit(index)}
                              >
                                <Pencil className="size-3.5" />
                              </IconButton>
                              <IconButton
                                label={`Xóa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                                disabled={disabled}
                                onClick={() => itemsField.removeValue(index)}
                              >
                                <Trash2 className="size-3.5" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <form.Subscribe
                selector={(state) => [
                  state.values.currency,
                  state.values.exchangeRate,
                ]}
              >
                {([currency, exchangeRate]) => (
                  <OrderItemDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    initialValue={editingItem}
                    onSubmit={handleSubmit}
                    currency={currency as Currency}
                    exchangeRate={exchangeRate}
                  />
                )}
              </form.Subscribe>
            </div>
          )
        }}
      </form.Field>
    )
  },
})

import { useState } from "react"
import { useField } from "@tanstack/react-form"
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
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { withForm } from "@/hooks/use-app-form"
import { OrderItemDialog } from "@/features/orders/components/composites/OrderItemDialog"
import { estimateLineTotal } from "@/features/orders/logic/order-totals"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { currencyFormatter } from "@/lib/currency"
import { orderItemStatusLabels, OrderItemStatus } from "@/lib/types/order.type"

export const UpdateOrderItemsSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const currencyField = useField({ form, name: "currency" })
    const exchangeRateField = useField({ form, name: "exchangeRate" })

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
                  isDisabled={disabled}
                  onPress={openAdd}
                >
                  <Plus className="size-4" />
                  Thêm sản phẩm
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table aria-label="Danh sách sản phẩm">
                  <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
                    <TableHead id="index" className="w-12">
                      #
                    </TableHead>
                    <TableHead id="item" isRowHeader>
                      Sản phẩm
                    </TableHead>
                    <TableHead id="unit">ĐVT</TableHead>
                    <TableHead id="quantity" className="text-right">
                      Số lượng
                    </TableHead>
                    <TableHead id="unitPrice" className="text-right">
                      Đơn giá
                    </TableHead>
                    <TableHead id="discountPercent" className="text-right">
                      CK (%)
                    </TableHead>
                    <TableHead id="total" className="text-right">
                      Thành tiền
                    </TableHead>
                    <TableHead id="status">Trạng thái</TableHead>
                    <TableHead id="actions" className="w-32 text-right">
                      Thao tác
                    </TableHead>
                  </TableHeader>
                  <TableBody
                    renderEmptyState={() => (
                      <TableEmpty
                        colSpan={9}
                        title="Chưa có sản phẩm nào"
                        description="Bấm “Thêm sản phẩm” để thêm."
                      />
                    )}
                  >
                    {items.map((item, index) => (
                      <TableRow
                        key={index}
                        id={index}
                        className="h-14 bg-card hover:bg-muted/25"
                      >
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>{item.itemLabel || "—"}</TableCell>
                        <TableCell>{item.itemUnit || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {currencyFormatter.format(item.unitPrice ?? 0)}
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
                              {orderItemStatusLabels[item.status]}
                            </span>
                          ) : (
                            <span className="text-success">
                              {orderItemStatusLabels[item.status]}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Di chuyển lên dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                isDisabled={disabled || index === 0}
                                onPress={() =>
                                  itemsField.moveValue(index, index - 1)
                                }
                              >
                                <ArrowUp className="size-3.5" />
                              </Button>
                              <Tooltip>{`Di chuyển lên dòng ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Di chuyển xuống dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                isDisabled={
                                  disabled || index === items.length - 1
                                }
                                onPress={() =>
                                  itemsField.moveValue(index, index + 1)
                                }
                              >
                                <ArrowDown className="size-3.5" />
                              </Button>
                              <Tooltip>{`Di chuyển xuống dòng ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Sửa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                isDisabled={disabled}
                                onPress={() => openEdit(index)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Tooltip>{`Sửa dòng ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Xóa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                                isDisabled={disabled}
                                onPress={() => itemsField.removeValue(index)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                              <Tooltip>{`Xóa dòng ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <OrderItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialValue={editingItem}
                onSubmit={handleSubmit}
                currency={currencyField.state.value}
                exchangeRate={exchangeRateField.state.value}
              />
            </div>
          )
        }}
      </form.Field>
    )
  },
})

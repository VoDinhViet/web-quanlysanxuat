import { useState } from "react"
import { useField } from "@tanstack/react-form"
import { Pencil, Plus, Trash2 } from "lucide-react"

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
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { withForm } from "@/hooks/use-app-form"
import { InventoryReceiptItemDialog } from "@/features/inventory-receipts/components/composites/InventoryReceiptItemDialog"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { InventoryReceiptItemFormValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import { resolveInventoryReceiptItemType } from "@/lib/types/inventory-receipt.type"
import { vndFormatter } from "@/lib/currency"

// Chế độ chọn vật tư/thành phẩm chung — mặc định khi phiếu chưa gắn `purchaseOrderId`. Loại vật
// phẩm (`itemType`) suy từ `receiptType` đang chọn qua `resolveInventoryReceiptItemType` — không
// hardcode "RM": PURCHASE tìm vật tư, RETURN/PRODUCTION tìm thành phẩm. Không có cột ĐVT:
// itemOptionsQueryOptions (qua useGetInventoryReceiptItemOptions) chỉ trả {id,code,name}, không
// có unit.
export const InventoryReceiptCreateGenericItemsSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const receiptType = useField({ form, name: "receiptType" }).state.value
    const itemType = resolveInventoryReceiptItemType(receiptType)
    const itemNoun = itemType === "FG" ? "thành phẩm" : "vật tư"

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

          const handleSubmit = (value: InventoryReceiptItemFormValue) => {
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
                    Danh sách {itemNoun}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Phiếu cần ít nhất một dòng {itemNoun}
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
                  Thêm {itemNoun}
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table aria-label={`Danh sách ${itemNoun}`}>
                  <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
                    <TableHead id="index" className="w-12">
                      #
                    </TableHead>
                    <TableHead id="item" isRowHeader>
                      {itemType === "FG" ? "Thành phẩm" : "Vật tư"}
                    </TableHead>
                    <TableHead id="quantity" className="text-right">
                      Số lượng
                    </TableHead>
                    <TableHead id="unitPrice" className="text-right">
                      Đơn giá
                    </TableHead>
                    <TableHead id="total" className="text-right">
                      Thành tiền
                    </TableHead>
                    <TableHead id="note">Ghi chú</TableHead>
                    <TableHead id="actions" className="w-24 text-right">
                      Thao tác
                    </TableHead>
                  </TableHeader>
                  <TableBody
                    renderEmptyState={() => (
                      <TableEmpty
                        colSpan={7}
                        title={`Chưa có ${itemNoun} nào`}
                        description={`Bấm “Thêm ${itemNoun}” để thêm.`}
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
                        <TableCell className="text-right tabular-nums">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.unitPrice !== undefined
                            ? vndFormatter.format(item.unitPrice)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {item.unitPrice !== undefined
                            ? vndFormatter.format(
                                (item.quantity ?? 0) * item.unitPrice
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="max-w-40 truncate text-muted-foreground">
                          {item.note || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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

              <InventoryReceiptItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialValue={editingItem}
                onSubmit={handleSubmit}
                itemType={itemType}
              />
            </div>
          )
        }}
      </form.Field>
    )
  },
})

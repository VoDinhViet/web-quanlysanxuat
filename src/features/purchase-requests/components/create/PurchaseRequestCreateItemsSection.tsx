import { useState } from "react"
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
import { IconButton } from "@/components/shared/IconButton"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { withForm } from "@/hooks/use-app-form"
import { PurchaseRequestItemDialog } from "@/features/purchase-requests/components/create/PurchaseRequestItemDialog"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"

export const PurchaseRequestCreateItemsSection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
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

          const handleSubmit = (value: PurchaseRequestItemFormValue) => {
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
                    Danh sách vật tư
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Đề xuất cần ít nhất một dòng vật tư
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
                  Thêm vật tư
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12 hover:bg-muted/45">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Vật tư</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="w-24 text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableEmptyRow
                        colSpan={5}
                        message="Đề xuất cần ít nhất một dòng vật tư. Bấm “Thêm vật tư” để thêm."
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
                          <TableCell>{item.itemLabel || "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="max-w-40 truncate text-muted-foreground">
                            {item.note || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
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

              <PurchaseRequestItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialValue={editingItem}
                onSubmit={handleSubmit}
              />
            </div>
          )
        }}
      </form.Field>
    )
  },
})

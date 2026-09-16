import { useState } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import { Image } from "@unpic/react"
import { AddSquare, CheckCircle, Gallery, InfoCircle } from "@solar-icons/react"
import { Boxes, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { useAppForm } from "@/hooks/use-app-form"
import { BomItemDrawingField } from "@/features/products/components/composites/BomItemDrawingField"
import { CreateConsumableDialog } from "@/features/products/components/composites/CreateConsumableDialog"
import type { UseProductBomResult } from "@/features/products/hooks/use-product-bom"
import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItem } from "@/lib/types/bom-item.type"
import { resolveFileUrl } from "@/lib/file-url"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type BomItemConsumablesTableProps = {
  bomItem: BomItem
  consumables: BomItem[]
  // false khi bomItem còn cấu trúc con (COMPONENT) bên dưới — chỉ cấp cuối cùng
  // (không còn con) mới được gắn vật tư trực tiếp, để tránh vật tư nằm rải
  // rác giữa các cấp làm sai lệch cách nổ (explode) nhu cầu vật tư theo cây.
  canAddConsumables: boolean
  bom: UseProductBomResult
}

function EditConsumableRow({
  consumable,
  bom,
  onDone,
}: {
  consumable: BomItem
  bom: UseProductBomResult
  onDone: () => void
}) {
  // Giữ ô "Thứ tự sắp xếp" ở đây dù BomItemInfoTab (form Thông tin hạng mục, COMPONENT/ROOT) đã bỏ —
  // vật tư (CONSUMABLE) không có cách sắp xếp nào khác (không kéo-thả trong bảng này), nên ô nhập tay vẫn
  // là đường duy nhất để đổi thứ tự hiển thị.
  const defaultValues: UpdateBomItemSchema = {
    quantity: consumable.quantity,
    sortOrder: consumable.sortOrder,
    note: consumable.note ?? "",
    drawing: consumable.drawing,
  }
  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: updateBomItemSchema },
    onSubmit: ({ value }) => bom.updateItem(value, consumable.id, onDone),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-4 rounded-md border border-dashed border-primary/40 bg-primary/5 p-4"
    >
      <p className="text-xs text-muted-foreground">
        <span className="font-mono font-bold text-foreground">
          {consumable.code}
        </span>{" "}
        — {consumable.name}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <form.AppField name="quantity">
          {(field) => <field.NumberField label="Số lượng" required />}
        </form.AppField>

        <form.AppField name="sortOrder">
          {(field) => (
            <field.NumberField
              label="Thứ tự sắp xếp"
              thousandSeparator={false}
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              label="Ghi chú"
              placeholder="Ghi chú (nếu có)..."
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="drawing">
        {(field) => (
          <BomItemDrawingField
            value={field.state.value}
            onChange={field.handleChange}
            disabled={bom.isSaving}
          />
        )}
      </form.AppField>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDone}
          disabled={bom.isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" size="sm" disabled={bom.isSaving}>
          <CheckCircle className="size-3.5" />
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}

// Vật tư con trực tiếp của một BomItem (ROOT hoặc COMPONENT) — bảng bên trong tab
// "Vật tư" của BomItemDetailPage, tách hẳn khỏi cây cấu trúc chính
// (ProductBomTable không còn hiển thị dòng CONSUMABLE nào nữa). Thêm vật tư qua
// CreateConsumableDialog (cùng khuôn với CreateComponentItemDialog); sửa vẫn mở tại
// chỗ (dòng mở rộng trong bảng, cùng kiểu với panel công đoạn ở
// ProductOperationsPanel). Xoá không cần xác nhận, cùng lý do và cùng tiền lệ
// với "Xoá công đoạn" ở ProductOperationsPanel — rủi ro thấp, dễ thêm lại
// nếu lỡ tay.
export function BomItemConsumablesTable({
  bomItem,
  consumables,
  canAddConsumables,
  bom,
}: BomItemConsumablesTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingConsumableId, setEditingConsumableId] = useState<string | null>(
    null
  )
  const columnCount = 5

  return (
    <div className="space-y-3">
      <PermissionGate permission="items:bom-manage">
        {canAddConsumables ? (
          <div className="flex justify-end">
            <Button
              type="button"
              className="gap-1.5"
              onClick={() => setIsCreateOpen(true)}
            >
              <AddSquare className="size-3.5" />
              Thêm vật tư
            </Button>
          </div>
        ) : (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <InfoCircle className="mt-0.5 size-3.5 shrink-0" />
            Còn cấu trúc con bên dưới nên không gắn vật tư trực tiếp ở đây — chỉ
            cấp cuối cùng (không còn con) mới thêm được vật tư.
          </p>
        )}
      </PermissionGate>

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Danh sách vật tư">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              <TableHead className="w-14">STT</TableHead>
              <TableHead>VẬT TƯ</TableHead>
              <TableHead className="w-20">ĐVT</TableHead>
              <TableHead className="w-28 text-center">SỐ LƯỢNG</TableHead>
              <PermissionGate permission="items:bom-manage">
                <TableHead className="w-28 text-right">THAO TÁC</TableHead>
              </PermissionGate>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <TableEmpty
                    icon={Boxes}
                    colSpan={columnCount}
                    title="Chưa có vật tư nào"
                  />
                </TableCell>
              </TableRow>
            ) : (
              consumables.map((consumable, idx) =>
                editingConsumableId === consumable.id ? (
                  <TableRow key={consumable.id} className="hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="p-3">
                      <EditConsumableRow
                        consumable={consumable}
                        bom={bom}
                        onDone={() => setEditingConsumableId(null)}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={consumable.id} id={consumable.id} className="h-14">
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                          {consumable.image ? (
                            <Image
                              src={resolveFileUrl(consumable.image.url)}
                              alt={consumable.name}
                              layout="fullWidth"
                              objectFit="cover"
                              className="size-full"
                            />
                          ) : (
                            <Gallery className="size-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-foreground">
                            {consumable.code}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {consumable.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {consumable.unit ? (
                        <span title={consumable.unit.code}>
                          {consumable.unit.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground tabular-nums">
                      {quantityFormatter.format(consumable.quantity)}
                    </TableCell>
                    <PermissionGate permission="items:bom-manage">
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label="Sửa vật tư"
                                  onClick={() =>
                                    setEditingConsumableId(consumable.id)
                                  }
                                  className="border border-border/60 hover:bg-muted"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              }
                            />
                            <TooltipContent>Sửa vật tư</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label="Xoá vật tư"
                                  onClick={() => bom.deleteItem(consumable.id)}
                                  className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              }
                            />
                            <TooltipContent>Xoá vật tư</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </PermissionGate>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      <CreateConsumableDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) =>
          bom.createItems(
            values.map((value) => ({ ...value, parentId: bomItem.id })),
            () => setIsCreateOpen(false)
          )
        }
        isSaving={bom.isSaving}
      />
    </div>
  )
}

import { Icon } from "@iconify/react"
import boxMinimalisticBold from "@iconify-icons/solar/box-minimalistic-bold"
import checkCircleBold from "@iconify-icons/solar/check-circle-bold"
import layersBold from "@iconify-icons/solar/layers-bold"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { useGetBomMaterialOptions } from "@/features/products/hooks/use-get-bom-material-options"
import { useGetBomProductOptions } from "@/features/products/hooks/use-get-bom-product-options"
import {
  CREATE_BOM_ITEM_DEFAULT_VALUES,
  createBomItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItemDialogState } from "@/features/products/hooks/use-product-bom"
import type {
  BomItem,
  BomItemType,
} from "@/features/products/types/bom-item.type"
import { cn } from "@/lib/utils"

type BomItemFormDialogProps = {
  dialog: BomItemDialogState
  onOpenChange: (open: boolean) => void
  onCreate: (value: CreateBomItemSchema, parentId: string | null) => void
  onUpdate: (value: UpdateBomItemSchema, itemId: string) => void
  isSaving: boolean
}

export function BomItemFormDialog({
  dialog,
  onOpenChange,
  onCreate,
  onUpdate,
  isSaving,
}: BomItemFormDialogProps) {
  return (
    <Dialog open={dialog.mode !== "closed"} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {dialog.mode === "create" ? (
          <CreateBomItemForm
            onSubmit={(value) => onCreate(value, dialog.parentId)}
            onCancel={() => onOpenChange(false)}
            isSaving={isSaving}
          />
        ) : dialog.mode === "update" ? (
          <UpdateBomItemForm
            node={dialog.node}
            onSubmit={(value) => onUpdate(value, dialog.node.id)}
            onCancel={() => onOpenChange(false)}
            isSaving={isSaving}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type BomItemPickerProps = {
  itemType: BomItemType
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  isInvalid: boolean
  errors: React.ComponentProps<typeof ComboboxField>["errors"]
}

// Both option hooks run (hook rules); only the one matching `itemType` is shown.
function BomItemPicker({
  itemType,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  errors,
}: BomItemPickerProps) {
  const productOptions = useGetBomProductOptions()
  const materialOptions = useGetBomMaterialOptions()
  const source = itemType === "PRODUCT" ? productOptions : materialOptions

  return (
    <ComboboxField
      label={
        itemType === "PRODUCT"
          ? "Chọn Bán thành phẩm (WIP)"
          : "Chọn Vật tư / Linh kiện"
      }
      required
      placeholder={
        itemType === "PRODUCT"
          ? "Tìm mã hoặc tên sản phẩm..."
          : "Tìm mã hoặc tên vật tư..."
      }
      value={value || undefined}
      onValueChange={(next) => onValueChange(next ?? "")}
      onBlur={onBlur}
      options={source.options}
      onSearchChange={source.onSearchChange}
      isLoading={source.isFetching}
      isInvalid={isInvalid}
      errors={errors}
    />
  )
}

type CreateBomItemFormProps = {
  onSubmit: (value: CreateBomItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateBomItemForm({
  onSubmit,
  onCancel,
  isSaving,
}: CreateBomItemFormProps) {
  const form = useAppForm({
    defaultValues: CREATE_BOM_ITEM_DEFAULT_VALUES,
    validators: { onSubmit: createBomItemSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Thêm thành phần BOM
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thêm vật tư hoặc bán thành phẩm vào cấu trúc sản phẩm.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4.5">
        {/* Visual Card Selector for itemType using Solar Icons */}
        <form.AppField name="itemType">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Loại thành phần <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Material Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    field.handleChange("MATERIAL")
                    form.setFieldValue("itemId", "")
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                    field.state.value === "MATERIAL"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Icon
                        icon={boxMinimalisticBold}
                        className={cn(
                          "size-4",
                          field.state.value === "MATERIAL"
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      Vật tư / Linh kiện
                    </span>
                    {field.state.value === "MATERIAL" ? (
                      <Icon
                        icon={checkCircleBold}
                        className="size-4 text-primary"
                      />
                    ) : null}
                  </div>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    Linh kiện, vật tư đầu vào
                  </p>
                </button>

                {/* WIP Product Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    field.handleChange("PRODUCT")
                    form.setFieldValue("itemId", "")
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                    field.state.value === "PRODUCT"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Icon
                        icon={layersBold}
                        className={cn(
                          "size-4",
                          field.state.value === "PRODUCT"
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      Sản phẩm (WIP)
                    </span>
                    {field.state.value === "PRODUCT" ? (
                      <Icon
                        icon={checkCircleBold}
                        className="size-4 text-primary"
                      />
                    ) : null}
                  </div>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    Bán thành phẩm chế tạo
                  </p>
                </button>
              </div>
            </div>
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.itemType}>
          {(itemType) => (
            <form.AppField name="itemId">
              {(field) => (
                <BomItemPicker
                  itemType={itemType}
                  value={field.state.value}
                  onValueChange={(next) => field.handleChange(next)}
                  onBlur={field.handleBlur}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  errors={field.state.meta.errors}
                />
              )}
            </form.AppField>
          )}
        </form.Subscribe>

        <form.AppField name="quantity">
          {(field) => (
            <field.TextField
              id="bom-item-quantity"
              label="Số lượng định mức"
              required
              type="number"
              placeholder="Ví dụ: 1"
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              id="bom-item-note"
              label="Ghi chú thành phần"
              placeholder="Ghi chú quy cách hoặc thông tin thêm (nếu có)..."
            />
          )}
        </form.AppField>
      </div>

      <DialogFooter className="gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Icon icon={checkCircleBold} className="size-4" />
          Thêm vào BOM
        </Button>
      </DialogFooter>
    </form>
  )
}

type UpdateBomItemFormProps = {
  node: BomItem
  onSubmit: (value: UpdateBomItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

function UpdateBomItemForm({
  node,
  onSubmit,
  onCancel,
  isSaving,
}: UpdateBomItemFormProps) {
  const form = useAppForm({
    defaultValues: {
      quantity: node.quantity,
      sortOrder: String(node.sortOrder),
      note: node.note ?? "",
    },
    validators: { onSubmit: updateBomItemSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Sửa thành phần BOM
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          <strong className="font-mono text-foreground">{node.code}</strong> —{" "}
          {node.name}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="quantity">
          {(field) => (
            <field.TextField
              id="edit-bom-item-quantity"
              label="Số lượng"
              required
              type="number"
            />
          )}
        </form.AppField>

        <form.AppField name="sortOrder">
          {(field) => (
            <field.TextField
              id="edit-bom-item-sort-order"
              label="Thứ tự sắp xếp"
              required
              type="number"
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="note">
        {(field) => (
          <field.TextareaField
            id="edit-bom-item-note"
            label="Ghi chú"
            placeholder="Ghi chú (nếu có)..."
          />
        )}
      </form.AppField>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Icon icon={checkCircleBold} className="size-4" />
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </form>
  )
}

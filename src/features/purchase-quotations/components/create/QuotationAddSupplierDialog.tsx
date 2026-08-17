import { useState } from "react"
import { CheckCircle } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { QuotationAddSupplierItems } from "@/features/purchase-quotations/components/create/QuotationAddSupplierItems"
import { useQuotationSupplierChecklist } from "@/features/purchase-quotations/hooks/use-quotation-supplier-checklist"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

// What the dialog emits on submit — a transient command, not a form value. It never reaches the
// wire and never lands in form state as-is: the parent (CreateQuotationSuppliersSection) turns
// it into N appended QuotationItemSupplierValue entries (already validated elsewhere by
// quotationItemSupplierSchema), one per targeted item. Since the dialog isn't producing a
// persisted record, it doesn't need useAppForm/a Zod schema of its own — its one rule ("pick a
// supplier + at least one addable item") is expressed by the disabled submit button below.
export type QuotationSupplierSelection = {
  supplierId: string
  supplierLabel: string
  itemIds: string[]
}

type QuotationAddSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Every item currently in the form, in form order — the checklist's universe.
  items: PickedQuotationItemValue[]
  // Checked when the dialog opens: one id from a row's own "+ Thêm NCC" trigger, or empty from
  // the section header's bulk entry point.
  initialItemIds: string[]
  onSubmit: (selection: QuotationSupplierSelection) => void
}

export function QuotationAddSupplierDialog({
  open,
  onOpenChange,
  items,
  initialItemIds,
  onSubmit,
}: QuotationAddSupplierDialogProps) {
  // The NCC combobox must portal its popup inside this dialog's own DOM subtree (see
  // ComboboxField's `container` doc), same pattern as OrderItemDialog.tsx.
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContentNode}
        className="shadow-lg ring-0 sm:max-w-3xl"
      >
        {/* Radix unmounts content while closed, so this form re-mounts on each open and its
            supplier/checked state seeds fresh from `initialItemIds` — this is what fixes the old
            inline combobox never resetting after a pick. */}
        <QuotationAddSupplierDialogForm
          container={contentNode}
          items={items}
          initialItemIds={initialItemIds}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type QuotationAddSupplierDialogFormProps = {
  container: HTMLDivElement | null
  items: PickedQuotationItemValue[]
  initialItemIds: string[]
  onSubmit: (selection: QuotationSupplierSelection) => void
  onCancel: () => void
}

function QuotationAddSupplierDialogForm({
  container,
  items,
  initialItemIds,
  onSubmit,
  onCancel,
}: QuotationAddSupplierDialogFormProps) {
  const { suppliers, options, isFetching, onSearchChange } =
    useGetSupplierOptions()

  const {
    supplierId,
    setSupplierId,
    checkedIds,
    assignedIds,
    targetIds,
    allChecked,
    toggleItem,
    toggleAll,
  } = useQuotationSupplierChecklist(items, initialItemIds)

  function handleSubmit() {
    if (!supplierId || targetIds.length === 0) return

    onSubmit({
      supplierId,
      supplierLabel:
        suppliers.find((supplier) => supplier.id === supplierId)?.name ?? "",
      itemIds: targetIds,
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Thêm NCC cho vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chọn 1 NCC rồi tích các vật tư cần hỏi giá — giá báo và leadtime nhập
          sau ở từng dòng
        </DialogDescription>
      </DialogHeader>

      <ComboboxField
        id="quotation-add-supplier"
        label="Nhà cung cấp"
        required
        placeholder="Tìm mã hoặc tên NCC..."
        value={supplierId}
        onValueChange={setSupplierId}
        options={options}
        onSearchChange={onSearchChange}
        isPending={isFetching}
        emptyMessage="Không tìm thấy NCC"
        container={container}
      />

      <QuotationAddSupplierItems
        items={items}
        checkedIds={checkedIds}
        assignedIds={assignedIds}
        allChecked={allChecked}
        onToggleItem={toggleItem}
        onToggleAll={toggleAll}
      />

      {supplierId && targetIds.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Các vật tư đang tích đều đã có NCC này — tích thêm vật tư khác để thêm
          được.
        </p>
      )}

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={!supplierId || targetIds.length === 0}>
          <CheckCircle className="size-4" />
          {targetIds.length > 0
            ? `Thêm vào ${targetIds.length} vật tư`
            : "Thêm NCC"}
        </Button>
      </DialogFooter>
    </form>
  )
}

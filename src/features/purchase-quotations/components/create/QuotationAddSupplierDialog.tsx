import { useMemo, useState } from "react"
import { Check } from "lucide-react"

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
import { QuotationAddSupplierItems } from "@/features/purchase-quotations/components/create/QuotationAddSupplierItems"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

// What the dialog emits on submit — a transient command, not a form value. It never reaches the
// wire and never lands in form state as-is: the parent (CreateQuotationSuppliersSection) turns
// it into N appended QuotationSupplierQuoteValue entries (already validated elsewhere by
// quotationSupplierQuoteSchema), one per targeted item. Since the dialog isn't producing a
// persisted record, it doesn't need useAppForm/a Zod schema of its own — its one rule ("pick a
// supplier + at least one addable item") is expressed by the disabled submit button below.
export type QuotationSupplierSelection = {
  supplierId: string
  supplierLabel: string
  purchaseRequestItemIds: string[]
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
        className="shadow-lg ring-0 sm:max-w-lg"
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

  const [supplierId, setSupplierId] = useState<string>()
  // Lazy init: seeded once per mount, and this component remounts fresh every time the dialog
  // opens (see the "Radix unmounts" comment above).
  const [checkedIds, setCheckedIds] = useState(() => new Set(initialItemIds))

  // Items that already list the chosen supplier. Empty while no supplier is picked yet, so
  // nothing is disabled until there's something to compare against.
  const assignedIds = useMemo(
    () =>
      new Set(
        items
          .filter((item) =>
            item.quotes.some((quote) => quote.supplierId === supplierId)
          )
          .map((item) => item.purchaseRequestItemId)
      ),
    [items, supplierId]
  )

  const selectableIds = items
    .map((item) => item.purchaseRequestItemId)
    .filter((purchaseRequestItemId) => !assignedIds.has(purchaseRequestItemId))
  const targetIds = selectableIds.filter((id) => checkedIds.has(id))
  const allChecked =
    selectableIds.length > 0 && targetIds.length === selectableIds.length

  function toggleItem(purchaseRequestItemId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(purchaseRequestItemId)) {
        next.delete(purchaseRequestItemId)
      } else {
        next.add(purchaseRequestItemId)
      }
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setCheckedIds(checked ? new Set(selectableIds) : new Set())
  }

  function handleSubmit() {
    if (!supplierId || targetIds.length === 0) return

    onSubmit({
      supplierId,
      supplierLabel:
        suppliers.find((supplier) => supplier.id === supplierId)?.name ?? "",
      purchaseRequestItemIds: targetIds,
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
          <Check className="size-4" />
          {targetIds.length > 0
            ? `Thêm vào ${targetIds.length} vật tư`
            : "Thêm NCC"}
        </Button>
      </DialogFooter>
    </form>
  )
}

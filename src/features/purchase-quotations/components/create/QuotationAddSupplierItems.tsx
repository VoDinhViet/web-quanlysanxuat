import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAddSupplierItemsProps = {
  items: PickedQuotationItemValue[]
  checkedIds: Set<string>
  // Items that already list the currently-picked supplier — rendered checked + disabled with
  // an "(đã có)" hint instead of vanishing from the list, so the list length never shifts under
  // the cursor and it's clear WHY a row can't be toggled (same lesson the old per-item combobox
  // got wrong by silently hiding already-added suppliers).
  assignedIds: Set<string>
  allChecked: boolean
  onToggleItem: (purchaseRequestItemId: string) => void
  onToggleAll: (checked: boolean) => void
}

// Presentational checklist for QuotationAddSupplierDialog — the dialog owns all state (which
// supplier is picked, which items are checked), this only renders it and reports taps.
export function QuotationAddSupplierItems({
  items,
  checkedIds,
  assignedIds,
  allChecked,
  onToggleItem,
  onToggleAll,
}: QuotationAddSupplierItemsProps) {
  const newCount = items.filter(
    (item) =>
      checkedIds.has(item.purchaseRequestItemId) &&
      !assignedIds.has(item.purchaseRequestItemId)
  ).length

  return (
    <div className="rounded-md border border-border/60">
      <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2">
        <Checkbox
          id="quotation-add-supplier-all"
          checked={allChecked}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
        />
        <label
          htmlFor="quotation-add-supplier-all"
          className="flex-1 cursor-pointer text-xs font-medium"
        >
          {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </label>
        <span className="text-xs text-muted-foreground">
          Sẽ thêm cho {newCount} vật tư
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto p-1">
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Chưa có vật tư nào
          </p>
        ) : (
          items.map((item) => {
            const isAssigned = assignedIds.has(item.purchaseRequestItemId)
            const checkboxId = `quotation-add-supplier-item-${item.purchaseRequestItemId}`

            return (
              <div
                key={item.purchaseRequestItemId}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40"
              >
                <Checkbox
                  id={checkboxId}
                  checked={
                    isAssigned || checkedIds.has(item.purchaseRequestItemId)
                  }
                  disabled={isAssigned}
                  onCheckedChange={() =>
                    onToggleItem(item.purchaseRequestItemId)
                  }
                />
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 text-xs",
                    isAssigned && "cursor-not-allowed text-muted-foreground"
                  )}
                >
                  <span className="shrink-0 font-mono text-primary">
                    {item.itemCode}
                  </span>
                  <span className="flex-1 truncate">{item.itemName}</span>
                  {isAssigned && (
                    <span className="shrink-0 text-[11px]">(đã có)</span>
                  )}
                </label>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

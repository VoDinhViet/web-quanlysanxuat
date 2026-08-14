import { useMemo, useState } from "react"

import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

export interface UseQuotationSupplierChecklistResult {
  supplierId: string | undefined
  setSupplierId: (supplierId: string | undefined) => void
  checkedIds: Set<string>
  assignedIds: Set<string>
  targetIds: string[]
  allChecked: boolean
  toggleItem: (itemId: string) => void
  toggleAll: (checked: boolean) => void
}

/**
 * Owns QuotationAddSupplierDialogForm's "pick a supplier, tick which vật tư to add it to" state —
 * assignedIds/selectableIds/allChecked all recompute together off the same (items, supplierId,
 * checkedIds) triple, so the component just renders what this returns instead of re-deriving it
 * inline alongside its JSX.
 */
export function useQuotationSupplierChecklist(
  items: PickedQuotationItemValue[],
  initialItemIds: string[]
): UseQuotationSupplierChecklistResult {
  const [supplierId, setSupplierId] = useState<string>()
  // Lazy init: seeded once per mount, and the dialog this backs remounts fresh every time it
  // opens (Radix unmounts closed content).
  const [checkedIds, setCheckedIds] = useState(() => new Set(initialItemIds))

  // Items that already list the chosen supplier. Empty while no supplier is picked yet, so
  // nothing is disabled until there's something to compare against.
  const assignedIds = useMemo(
    () =>
      new Set(
        items
          .filter((item) =>
            item.suppliers.some(
              (supplier) => supplier.supplierId === supplierId
            )
          )
          .map((item) => item.itemId)
      ),
    [items, supplierId]
  )

  const selectableIds = items
    .map((item) => item.itemId)
    .filter((itemId) => !assignedIds.has(itemId))
  const targetIds = selectableIds.filter((id) => checkedIds.has(id))
  const allChecked =
    selectableIds.length > 0 && targetIds.length === selectableIds.length

  function toggleItem(itemId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setCheckedIds(checked ? new Set(selectableIds) : new Set())
  }

  return {
    supplierId,
    setSupplierId,
    checkedIds,
    assignedIds,
    targetIds,
    allChecked,
    toggleItem,
    toggleAll,
  }
}

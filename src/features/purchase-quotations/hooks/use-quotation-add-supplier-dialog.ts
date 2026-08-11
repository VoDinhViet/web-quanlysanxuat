import { useCallback, useState } from "react"
import type { AnyFieldApi } from "@tanstack/react-form"

import type { QuotationSupplierSelection } from "@/features/purchase-quotations/components/create/QuotationAddSupplierDialog"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

export interface UseQuotationAddSupplierDialogResult {
  isOpen: boolean
  setOpen: (open: boolean) => void
  initialItemIds: string[]
  openForItem: (purchaseRequestItemId: string) => void
  submit: (selection: QuotationSupplierSelection) => void
}

/**
 * Owns QuotationAddSupplierDialog's open/seed state plus the write it triggers on submit —
 * appending a fresh NCC quote row to every targeted item's `suppliers` array. Centralized here
 * (out of CreateQuotationSuppliersSection) since the write walks the whole `items` array and fans
 * out to one `itemsField.replaceValue` call per targeted item.
 */
export function useQuotationAddSupplierDialog(
  itemsField: AnyFieldApi,
  items: PickedQuotationItemValue[]
): UseQuotationAddSupplierDialogResult {
  const [isOpen, setOpen] = useState(false)
  // Pre-checked when the dialog opens: the one item whose own "Thêm NCC" trigger opened it —
  // still an array since the checklist itself can still target more than one item.
  const [initialItemIds, setInitialItemIds] = useState<string[]>([])

  const openForItem = useCallback((purchaseRequestItemId: string) => {
    setInitialItemIds([purchaseRequestItemId])
    setOpen(true)
  }, [])

  const submit = useCallback(
    ({
      supplierId,
      supplierLabel,
      purchaseRequestItemIds,
    }: QuotationSupplierSelection) => {
      const targetIds = new Set(purchaseRequestItemIds)

      // One replaceValue per touched item — form-core's replaceFieldValue applies a functional
      // update against the live store, so sequential calls here each build on the previous
      // one's result rather than overwriting each other.
      items.forEach((item, index) => {
        if (!targetIds.has(item.purchaseRequestItemId)) return

        itemsField.replaceValue(index, {
          ...item,
          suppliers: [
            ...item.suppliers,
            {
              supplierId,
              supplierLabel,
              lastPrice: "",
              lastPurchaseDate: "",
              unitPrice: "",
              leadTimeDays: "",
              note: "",
            },
          ],
        })
      })

      setOpen(false)
    },
    [items, itemsField]
  )

  return { isOpen, setOpen, initialItemIds, openForItem, submit }
}

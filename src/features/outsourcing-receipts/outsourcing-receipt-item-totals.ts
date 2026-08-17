import type { CreateOutsourcingReceiptItemValue } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"

export type OutsourcingReceiptItemTotals = {
  totalQuantity: number
  totalWeight: number
  totalArea: number
}

// Shared by the items/confirm steps and the post-submit success/print dialogs — same pattern as
// outsourcing-order-item-totals.ts.
export function sumOutsourcingReceiptItemTotals(
  items: CreateOutsourcingReceiptItemValue[]
): OutsourcingReceiptItemTotals {
  return items.reduce(
    (totals, item) => ({
      totalQuantity: totals.totalQuantity + (Number(item.quantity) || 0),
      totalWeight: totals.totalWeight + (Number(item.weight) || 0),
      totalArea: totals.totalArea + (Number(item.area) || 0),
    }),
    { totalQuantity: 0, totalWeight: 0, totalArea: 0 }
  )
}

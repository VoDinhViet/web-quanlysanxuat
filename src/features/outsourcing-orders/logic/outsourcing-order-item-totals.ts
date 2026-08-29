import type { CreateOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

export type OutsourcingOrderItemTotals = {
  totalQuantity: number
  totalWeight: number
  totalArea: number
}

// Shared by the items/confirm steps and the post-submit success dialog — all three summed the
// same 3 fields off the same item shape before this was extracted (see order-totals.ts for the
// same pattern elsewhere in the repo).
export function sumOutsourcingOrderItemTotals(
  items: CreateOutsourcingOrderItemValue[]
): OutsourcingOrderItemTotals {
  return items.reduce(
    (totals, item) => ({
      totalQuantity: totals.totalQuantity + (item.quantity ?? 0),
      totalWeight: totals.totalWeight + (item.weight ?? 0),
      totalArea: totals.totalArea + (item.area ?? 0),
    }),
    { totalQuantity: 0, totalWeight: 0, totalArea: 0 }
  )
}

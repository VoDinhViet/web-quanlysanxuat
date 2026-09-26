import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationItemStatus = {
  requestedTotal: number
  quotedTotal: number
  // Set only for a single-allocation vật tư whose SL báo giá differs from the request — a vật tư
  // merging ≥2 dòng ĐXMH edits its reasons inside QuotationAllocationsDialog instead.
  allocation: PickedQuotationItemValue["allocations"][number] | undefined
  isAdjusted: boolean
  isOver: boolean
  needsReason: boolean
  pricedSupplierCount: number
}

// Derived read-only numbers of one vật tư, shared by the list row and the supplier drawer so both
// show the same "thiếu giá / cần lý do" state.
export function getQuotationItemStatus(
  item: PickedQuotationItemValue
): QuotationItemStatus {
  const requestedTotal = item.allocations.reduce(
    (sum, allocation) => sum + allocation.requestedQuantity,
    0
  )
  const quotedTotal = item.allocations.reduce(
    (sum, allocation) => sum + (allocation.quantity ?? 0),
    0
  )
  const allocation =
    item.allocations.length === 1 ? item.allocations[0] : undefined
  const isAdjusted = allocation !== undefined && quotedTotal !== requestedTotal
  const isOver = allocation !== undefined && quotedTotal > requestedTotal
  const needsReason = isOver && !allocation.quantityAdjustmentReason.trim()

  return {
    requestedTotal,
    quotedTotal,
    allocation,
    isAdjusted,
    isOver,
    needsReason,
    pricedSupplierCount: item.suppliers.filter(
      (supplier) => supplier.unitPrice !== undefined
    ).length,
  }
}

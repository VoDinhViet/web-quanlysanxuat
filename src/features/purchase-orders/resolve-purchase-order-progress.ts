import {
  PurchaseOrderProgress,
  PurchaseOrderStatus,
} from "@/lib/types/purchase-order.type"
import type { PurchaseOrderApiRow } from "@/lib/types/purchase-order.type"

// `status` only ever stores DRAFT/ORDERED/CANCELLED (docs/domains/purchasing.md, backend repo) —
// "Đang nhận"/"Hoàn tất" are read-time derivations from receivedQuantity vs orderedQuantity, same
// as the ledger's status computation. Evaluated in order, first match wins.
export function resolvePurchaseOrderProgress(
  row: PurchaseOrderApiRow
): PurchaseOrderProgress {
  if (row.status === PurchaseOrderStatus.CANCELLED) {
    return PurchaseOrderProgress.CANCELLED
  }
  if (row.status === PurchaseOrderStatus.DRAFT) {
    return PurchaseOrderProgress.DRAFT
  }
  if (row.receivedQuantity >= row.orderedQuantity) {
    return PurchaseOrderProgress.COMPLETED
  }
  if (row.receivedQuantity > 0) {
    return PurchaseOrderProgress.RECEIVING
  }
  return PurchaseOrderProgress.ORDERED
}

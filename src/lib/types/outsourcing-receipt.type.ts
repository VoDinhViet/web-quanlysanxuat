import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

// Re-exported so call sites can import the shared `inventory_document_status` enum straight from
// this domain's own type file, same as importing any other field here.
export { InventoryDocumentStatus }

// Reuses `InventoryDocumentStatus` from supplier-return.type.ts (shared `inventory_document_
// status` pg enum) — only DRAFT/POSTED/CANCELLED are ever produced here, same subset supplier
// returns use. Own label map since the copy differs by domain ("Chờ nhận"/"Đã nhận" vs.
// "Chờ xuất"/"Đã xuất").
export const outsourcingReceiptStatusLabels: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Chờ nhận",
  [InventoryDocumentStatus.POSTED]: "Đã nhận",
  [InventoryDocumentStatus.CANCELLED]: "Đã huỷ",
}

/** Mirrors the backend's PageOutsourcingReceiptResDto (GET /api/outsourcing-receipts) — only the
 *  fields this list screen reads. `outsourcingOrder` carries the OS-OUT this receipt is against;
 *  the OS-OUT detail route doesn't exist yet, so `outsourcingOrder.code` renders as plain text,
 *  not a link (see OutsourcingReceiptsTableColumns.tsx). `posterBy`/`postedAt` are detail-only —
 *  see `OutsourcingReceiptDetail` below. */
export type OutsourcingReceipt = {
  id: string
  code: string
  outsourcingOrder: {
    id: string
    code: string
    status: InventoryDocumentStatus
    quantity: number
    sendDate: string
  }
  item: {
    id: string
    code: string
    name: string
    unit: Unit
  }
  quantity: number
  supplier: SupplierRef
  warehouse: WarehouseRef
  receiptDate: string
  requiresIqc: boolean
  status: InventoryDocumentStatus
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
}

/** Mirrors the backend's OutsourcingReceiptResDto (GET /api/outsourcing-receipts/:id) — adds
 *  `posterBy`/`postedAt` over the list row, both null until `status` reaches `POSTED`. */
export type OutsourcingReceiptDetail = OutsourcingReceipt & {
  posterBy: UserRef | null
  postedAt: string | null
}

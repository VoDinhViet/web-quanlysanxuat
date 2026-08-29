import type { FileResource } from "@/lib/types/file.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

/** Mirrors the backend's `inventory_document_status` pg enum
 *  (be-quanlysanxuat/src/database/schemas/inventory/inventory-documents.ts) — shared across every
 *  kho chứng từ (nhập/xuất/trả), not just supplier returns. Kept here rather than its own
 *  `inventory-document.type.ts` since this is the only screen reading it so far; split out once a
 *  second one does (no abstraction before the 3rd use). */
export enum InventoryDocumentStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  CANCELLED = "CANCELLED",
}

export const inventoryDocumentStatusLabels: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Chờ xuất",
  [InventoryDocumentStatus.POSTED]: "Đã xuất",
  [InventoryDocumentStatus.CANCELLED]: "Đã huỷ",
}

/** Mirrors the backend's PageSupplierReturnResDto (GET /api/supplier-returns) — only the fields
 *  this list screen reads. Drops `warehouse`/`creatorBy`/`updatedAt`, which the response carries
 *  but the mockup doesn't show. `purchaseOrder`/`inventoryReceipt` are null whenever the return
 *  isn't linked to a PO/phiếu nhập — the table renders that as a flagged placeholder, not a plain
 *  empty dash (see MissingFieldValue usage in SupplierReturnTableCells.tsx). */
export type SupplierReturn = {
  id: string
  code: string
  item: {
    id: string
    code: string
    name: string
    unit: Unit
  }
  quantity: number
  supplier: SupplierRef
  purchaseOrder: { id: string; code: string } | null
  inventoryReceipt: { id: string; code: string } | null
  iqc: { id: string; code: string } | null
  status: InventoryDocumentStatus
  returnDate: string
  createdAt: string
}

/** Mirrors the backend's `SupplierReturnResDto` (`GET /api/supplier-returns/:id`) field-for-field
 *  — the detail page's read. Superset of `SupplierReturn` above (adds `warehouse`/`note`/
 *  `posterBy`/`postedAt`/`returnReason`/`postNote`/`files`), same "list row is a subset of detail"
 *  split as `PurchaseOrder`/`PurchaseOrderDetail`. `posterBy`/`postedAt`/`postNote`/`files` are
 *  only set once `status` reaches `POSTED` — `postNote`/`files` come from the `post` call itself
 *  (both optional there, so still `null`/`[]` on a POSTED return with neither). `returnReason` is
 *  not its own column — the backend reads it off the linked IQC inspection's `dispositionNote`. */
export type SupplierReturnDetail = SupplierReturn & {
  warehouse: WarehouseRef
  note: string | null
  posterBy: UserRef | null
  postedAt: string | null
  returnReason: string | null
  postNote: string | null
  files: FileResource[]
}

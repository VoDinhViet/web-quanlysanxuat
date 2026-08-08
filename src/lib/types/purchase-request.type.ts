import type { Department } from "@/lib/types/department.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `purchase_requests.status` column. `DRAFT → PENDING_APPROVAL` (send) →
 *  `APPROVED`/`REJECTED` (approve/reject). `REJECTED` is a dead end with no direct route back to
 *  `DRAFT` — editing or deleting a line (`PATCH`/`DELETE .../items/:id`) is the only way out,
 *  which flips it to `DRAFT` as a side effect (see `docs/domains/purchase-requests.md` ở repo
 *  backend). */
export const PurchaseRequestStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus]

export const purchaseRequestStatusLabels: Record<
  PurchaseRequestStatus,
  string
> = {
  [PurchaseRequestStatus.DRAFT]: "Nháp",
  [PurchaseRequestStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [PurchaseRequestStatus.APPROVED]: "Đã duyệt",
  [PurchaseRequestStatus.REJECTED]: "Từ chối",
}

/** Mirrors the backend's UserRefResDto — nested 4x in PurchaseRequestResDto/PagePurchaseRequestResDto
 *  (`requesterBy`/`senderBy`/`approverBy`/`rejecterBy`), one per audit-trail step. */
export type PurchaseRequestUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's ProductionOrderRefResDto — `code` is only set once the LSX is APPROVED,
 *  hence nullable. */
export type PurchaseRequestProductionOrderRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's PagePurchaseRequestResDto — one row of `GET /purchase-requests`, the "Đề
 *  xuất mua hàng" list screen. Carries the full approval audit trail
 *  (`senderBy`/`sentAt`/`approverBy`/`approvedAt`/`rejecterBy`/`rejectedAt`/`rejectionReason`) even
 *  though the list table doesn't render it yet — kept for type accuracy with the wire shape. */
export type PurchaseRequest = {
  id: string
  code: string
  neededDate: string
  status: PurchaseRequestStatus
  createdAt: string
  department: Department
  requesterBy: PurchaseRequestUserRef | null
  senderBy: PurchaseRequestUserRef | null
  sentAt: string | null
  approverBy: PurchaseRequestUserRef | null
  approvedAt: string | null
  rejecterBy: PurchaseRequestUserRef | null
  rejectedAt: string | null
  rejectionReason: string | null
  productionOrder: PurchaseRequestProductionOrderRef | null
}

/** Mirrors the backend's ProductionJobRefResDto — the specific Job (within a LSX) a shortage
 *  request was auto-generated for, if any (see `ProductionJobsService.startJob` in
 *  `docs/domains/purchase-requests.md`). */
export type PurchaseRequestProductionJobRef = {
  id: string
  code: string
}

/** Mirrors the backend's OrderItemRefResDto nested in a purchase request line —
 *  `purchase_request_items` always points at an RM in practice, but the column itself references
 *  the shared `items` table. The DTO also carries `image` — omitted here since this feature never
 *  renders an item's image (same narrowing idiom as `item.type.ts`'s RM-only field omission). */
export type PurchaseRequestItemRef = {
  id: string
  code: string
  name: string
  unit: Unit
}

/** Mirrors the backend's PurchaseRequestItemResDto — one line of a request (`purchase_request_items`).
 *  `quantity` is the shortage amount frozen at start-job time; `onHand`/`bomDemand`/`available`/
 *  `fromStock` are all read live at request time (NOT at PR-creation time) — don't derive "still
 *  short" as `onHand − quantity` (different clocks). `bomDemand` is the whole linked Job's demand
 *  (or every Job of the LSX if no specific Job), not this line's own `quantity` — don't compare the
 *  two directly. `available = onHand − bomDemand` (can be negative); `fromStock = min(onHand,
 *  bomDemand)`. A PR with no Job/LSX link legitimately has `bomDemand: 0` (see "Common mistakes" in
 *  the backend's `docs/domains/purchase-requests.md`). `note` is writable via
 *  `PATCH /purchase-requests/:purchaseRequestId/items/:purchaseRequestItemId` — only while the
 *  parent request is `DRAFT` or `REJECTED` (editing a `REJECTED` line flips it back to `DRAFT` as
 *  a side effect), requires `purchase-requests:update`. */
export type PurchaseRequestItem = {
  id: string
  item: PurchaseRequestItemRef
  quantity: number
  onHand: number
  bomDemand: number
  available: number
  fromStock: number
  note: string | null
}

/** Mirrors the backend's PurchaseRequestResDto (`GET /purchase-requests/:purchaseRequestId`). The
 *  DTO also carries `receipts` (inventory receipts already linked to this request) — omitted here,
 *  no screen reads it yet (same narrowing idiom as `PurchaseRequestItemRef.image` above).
 *  `senderBy`/`approverBy`/`rejecterBy` (+ their `*At` timestamps) are the approval audit trail —
 *  populated by the `send`/`approve`/`reject` routes; `rejectionReason` stays populated as history
 *  even after a rejected request is edited back to `DRAFT` and resent (the backend never clears
 *  it), so don't treat its presence alone as "currently rejected" — check `status` too. */
export type PurchaseRequestDetail = {
  id: string
  code: string
  neededDate: string
  status: PurchaseRequestStatus
  createdAt: string
  department: Department
  requesterBy: PurchaseRequestUserRef | null
  senderBy: PurchaseRequestUserRef | null
  sentAt: string | null
  approverBy: PurchaseRequestUserRef | null
  approvedAt: string | null
  rejecterBy: PurchaseRequestUserRef | null
  rejectedAt: string | null
  rejectionReason: string | null
  productionOrder: PurchaseRequestProductionOrderRef | null
  productionJob: PurchaseRequestProductionJobRef | null
  items: PurchaseRequestItem[]
}

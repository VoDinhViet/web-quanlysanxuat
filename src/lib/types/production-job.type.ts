import type { BomItemType } from "@/lib/types/bom-item.type"
import type { FileResource } from "@/lib/types/file.type"
import type { OperationType } from "@/lib/types/operation.type"
import type { OrderClientRef, OrderRef } from "@/lib/types/order.type"
import type { ItemRef } from "@/lib/types/item.type"

/** Mirrors the backend's real `production_jobs.status` column (`GET /production-jobs`,
 *  `GET /production-jobs/:jobId`). Rút còn 2 giá trị 2026-08-01 theo yêu cầu nghiệp vụ — không
 *  còn `WAITING`, một chiều `PENDING → IN_PROGRESS`, không có đường lùi và không có điểm kết
 *  thúc nào khác `IN_PROGRESS` (xem `src/database/schemas/production.ts`, backend). */
export enum ProductionJobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
}

export const productionJobStatusLabels: Record<ProductionJobStatus, string> = {
  [ProductionJobStatus.PENDING]: "Chưa SX",
  [ProductionJobStatus.IN_PROGRESS]: "Đang SX",
}

/** Mirrors the backend's ProductionJobResDto — one row of `GET /production-jobs`, the "Quản lý
 *  sản xuất" screen. Split off from the detail shape 2026-07-31: the list only carries the columns
 *  the table needs, not the full Job (no `product` object, `startedAt` — those are
 *  `GET /production-jobs/:jobId`-only). `warning`/`producedQty` removed 2026-08-01 along with
 *  `producedQty`/`rejectedQty` off the `production_jobs` table itself — the backend has no
 *  progress-reporting route yet. */
export type ProductionJob = {
  id: string
  code: string
  orderCode: string
  client: OrderClientRef | null
  image: FileResource | null
  quantity: number
  orderDate: string
  dueDate: string | null
  status: ProductionJobStatus
}

/** Mirrors the backend's ProductionJobDetailResDto (`GET /production-jobs/:jobId`) — joins in
 *  the parent order, its client and the FG item (`OrderBaseResDto`/`ClientBaseResDto`/
 *  `ItemRefResDto` server-side). `productionOrderId` has no matching LSX code on this endpoint —
 *  the detail screen links to the LSX by id instead of rendering its code. */
export type ProductionJobDetail = {
  id: string
  code: string
  productionOrderId: string
  order: OrderRef
  // Cùng một dòng `clients` với `order.client` (service leftJoin `clients` trên
  // `orders.client_id`) — backend expose ở cả 2 chỗ; UI đọc field top-level này.
  client: OrderClientRef | null
  itemId: string
  item: ItemRef
  quantity: number
  status: ProductionJobStatus
  startedBy: string | null
  startedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's ProductionJobOperationResDto, nested in ProductionJobBomItem below — the
 *  as-used routing snapshot copied from `routing_steps` onto a single BOM node at LSX approval
 *  time (`production_job_operations`). `code`/`name`/`type`/`sortOrder`/`note`/`operationId` stay
 *  frozen; `completedQuantity`/`completedDate` are the only two fields editable afterwards, via
 *  `PATCH /production-jobs/:jobId/operations/:operationId` — `completedDate` is server-set (not
 *  part of the update payload), auto-filled once `completedQuantity` reaches the parent node's
 *  `plannedQuantity`, auto-cleared if edited back down. */
export type ProductionJobOperation = {
  id: string
  operationId: string | null
  code: string
  name: string
  type: OperationType
  sortOrder: number
  note: string | null
  completedQuantity: number
  completedDate: string | null
  createdAt: string
}

/** Mirrors the backend's ProductionJobBomItemResDto (`GET /production-jobs/:jobId/bom`) — one row
 *  of the Job's BOM tree, frozen at LSX approval time. A flat parent-child list (FE builds the
 *  tree via `parentId`; `parentId = null` is a top-level node, a direct child of the FG product),
 *  not a nested tree like `BomItem` — and it never includes the FG product itself, only real BOM
 *  nodes. Each node carries its own as-used `operations[]`. `plannedQuantity` (SL Job × cumulative
 *  parent-chain ratio) and `level` (1-based depth) are computed/stored server-side, not derived
 *  here. */
export type ProductionJobBomItem = {
  id: string
  parentId: string | null
  itemType: BomItemType
  code: string
  name: string
  quantity: number
  plannedQuantity: number
  level: number
  operations: ProductionJobOperation[]
}

/** Mirrors the backend's ProductionJobMaterialResDto (`GET /production-jobs/:jobId/materials`,
 *  paginated) — flat text snapshots off `production_job_materials`, independent of the live
 *  `items`/`units` tables (`itemId` is a reference-only link, nullable). `issuedQty` has
 *  no equivalent here (no stock-issue linkage on this endpoint) — the tab renders that column as
 *  "Chưa có API" via MissingFieldValue. */
export type ProductionJobMaterial = {
  itemId: string | null
  materialCode: string
  materialName: string
  unitCode: string
  unitName: string
  image: FileResource | null
  unitQty: number | null
  requiredQty: number
}

/** Mirrors the backend's UserRefResDto nested in ProductionJobNoteResDto. */
export type ProductionJobNoteCreator = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's ProductionJobNoteResDto (`GET /production-jobs/:jobId/notes`,
 *  paginated, sorted asc(createdAt) — a free-form conversation feed, not an audit log). */
export type ProductionJobNote = {
  id: string
  content: string
  creator: ProductionJobNoteCreator | null
  createdAt: string
}

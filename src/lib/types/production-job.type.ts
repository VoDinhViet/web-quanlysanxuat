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

/** Mirrors the backend's ProductionJobBomOperationResDto, nested in ProductionJobBomItem below —
 *  the as-used routing snapshot copied from `routing_steps` onto a single BOM node at LSX approval
 *  time (`production_job_operations`). `code`/`name`/`type`/`sortOrder`/`note`/`operationId` stay
 *  frozen; `completedQuantity`/`completedDate` are the only two fields editable afterwards, via
 *  `PATCH /production-jobs/:jobId/operations/:operationId` — `completedDate` is server-set (not
 *  part of the update payload), auto-filled once `completedQuantity` reaches the parent node's
 *  planned quantity, auto-cleared if edited back down. `plannedQuantity` is the parent BOM node's
 *  planned quantity (cumulative BOM ratio × Job quantity), frozen at LSX approval — same value on
 *  every operation of the same node; it's also the cap `completedQuantity` is checked against
 *  server-side (E088). */
export type ProductionJobOperation = {
  id: string
  operationId: string | null
  code: string
  name: string
  type: OperationType
  sortOrder: number
  note: string | null
  plannedQuantity: number
  completedQuantity: number
  completedDate: string | null
  createdAt: string
}

/** `FG` = node Cấp 0 (lắp ráp/đóng gói thành phẩm, luôn đứng cuối bảng "Công đoạn sản xuất",
 *  `ProductionJobsService.copyFinalAssemblyRouting` backend) — `WIP`/`RM` = node cây BOM thường.
 *  Riêng khỏi `ItemType` (`item.type.ts`, thu hẹp còn FG/WIP vì `Item` không bao giờ là RM) vì đây
 *  là node cây BOM snapshot của Job, có thể là cả 3 giá trị. */
export type ProductionJobBomItemType = "FG" | "WIP" | "RM"

/** Mirrors the backend's ProductionJobBomItemResDto (`GET /production-jobs/:jobId/operations`,
 *  a plain array, not paginated) — "Công đoạn sản xuất" tab: every BOM node (part) that has at
 *  least one as-used operation, each carrying its own `operations[]` (server-grouped — no more
 *  client-side grouping needed). Despite the name, this is NOT the full BOM tree: it's scoped to
 *  parts with operations, flat (no `parentId`) — no image, no gia công ngoài counts (see
 *  ProductionJobOperation's doc comment for `plannedQuantity`, carried per-operation not here). */
export type ProductionJobBomItem = {
  id: string
  code: string
  name: string
  itemType: ProductionJobBomItemType
  operations: ProductionJobOperation[]
}

/** Mirrors the backend's ProductionJobItemResDto, nested in ProductionJobIssue below — a snapshot
 *  text ref off the shared dimension table `production_job_items` (no `id`; identity is the
 *  content triple `(itemId, code, name)`, see docs/domains/production.md). */
export type ProductionJobIssueItemRef = {
  code: string
  name: string
}

/** Mirrors the backend's ProductionJobUnitResDto, nested in ProductionJobIssue below — same
 *  snapshot-dimension idiom as ProductionJobIssueItemRef above, off `production_job_units`. */
export type ProductionJobIssueUnitRef = {
  code: string
  name: string
}

/** Mirrors the backend's ProductionJobIssueResDto (`GET /production-jobs/:jobId/bom`, paginated,
 *  `q` filters `item.code`/`item.name`) — "BOM vật tư" tab: the Job's material demand, read off
 *  `production_job_issues` joined to the two shared dimension tables. Despite the route's name
 *  (`.../bom`), this is NOT the BOM tree — the tree has no read route at all (see
 *  ProductionJobOperation's doc comment and docs/domains/production.md, "Common mistakes" #15).
 *  `requiredQty` is BOM demand × SL Job, computed once at LSX approval — not a per-level BOM
 *  explosion. No `id`/`itemId`/`unitQty`/`image` on this DTO. */
export type ProductionJobIssue = {
  item: ProductionJobIssueItemRef
  unit: ProductionJobIssueUnitRef
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

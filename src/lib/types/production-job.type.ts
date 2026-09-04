import type { FileResource } from "@/lib/types/file.type"
import type { OperationType } from "@/lib/types/operation.type"
import type { OrderClientRef, OrderRef } from "@/lib/types/order.type"
import type { ItemRef } from "@/lib/types/item.type"

/** Mirrors the backend's real `production_jobs.status` column (`GET /production-jobs`,
 *  `GET /production-jobs/:jobId`). Khôi phục điểm kết thúc 2026-08-24 — `PENDING → IN_PROGRESS →
 *  WAITING_QC → WAITING_DELIVERY → COMPLETED`, một chiều, không đường lùi (xem
 *  `be-quanlysanxuat/docs/decisions/production-lifecycle-closing.md`). */
export enum ProductionJobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING_QC = "WAITING_QC",
  WAITING_DELIVERY = "WAITING_DELIVERY",
  COMPLETED = "COMPLETED",
}

export const productionJobStatusLabels: Record<ProductionJobStatus, string> = {
  [ProductionJobStatus.PENDING]: "Chưa SX",
  [ProductionJobStatus.IN_PROGRESS]: "Đang SX",
  [ProductionJobStatus.WAITING_QC]: "Chờ QC",
  [ProductionJobStatus.WAITING_DELIVERY]: "Chờ giao hàng",
  [ProductionJobStatus.COMPLETED]: "Hoàn thành",
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
  // Thêm 2026-08-25 — từng ghi bởi `POST .../approve-operations` (route đó đã xoá 2026-09-03,
  // bỏ bước duyệt công đoạn riêng). Giữ lại cho dữ liệu cũ, không còn route nào ghi và không
  // còn gate nào đọc — `PATCH .../operations/:operationId` mở ngay khi Job `IN_PROGRESS`.
  operationsApprovedBy: string | null
  operationsApprovedAt: string | null
  // true thì nút "Yêu cầu OQC" ở ProductionJobDetailHeader.tsx khoá lại — BE chặn tạo phiếu OQC
  // lần 2 cho cùng công đoạn Cấp 0 (E198).
  oqcRequested: boolean
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's ProductionJobBomOperationResDto, nested in ProductionJobBomItem below —
 *  the as-used routing snapshot copied from `routing_steps` onto a single BOM node at LSX approval
 *  time (`production_job_operations`). `code`/`name`/`type`/`sortOrder`/`note`/`operationId` stay
 *  frozen; `completedQuantity`/`rejectedQuantity`/`completedDate` are the only fields editable
 *  afterwards, via `POST /production-execution/operations/:jobOperationId/reports` — accumulates
 *  (doesn't overwrite), only runs once the Job is `IN_PROGRESS` (E087 otherwise, see
 *  ProductionJobDetail). `completedDate` is caller-supplied (the date the report names), set once
 *  `completedQuantity` (pass count only, NG doesn't count) reaches the parent node's planned
 *  quantity — never auto-cleared afterwards on the in-house path (only an OS-IN cancel can pull an
 *  OUTSOURCE row's `completedQuantity` back down). `plannedQuantity` is the parent BOM node's
 *  planned quantity (cumulative BOM ratio × Job quantity), frozen at LSX approval — same value on
 *  every operation of the same node; it's also the cap `completedQuantity` alone is checked
 *  against server-side (E256) — `rejectedQuantity` is uncapped. */
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
  rejectedQuantity: number
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

/** Một dòng "Part × công đoạn" cho dialog nhập báo cáo — dùng bởi cả bảng "DANH SÁCH PART"
 *  (màn "Thực hiện sản xuất") lẫn bảng "Công đoạn sản xuất" (chi tiết Job). Không mirror DTO
 *  nào: cả 2 màn tự ghép từ `GET /production-jobs/:jobId/operations` (BE nhóm sẵn theo BOM
 *  item). */
export type JobOperationReportRow = {
  bomItem: ProductionJobBomItem
  operation: ProductionJobOperation
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
 *  `requiredQty` is BOM demand exploded through every ancestor WIP node × SL Job, computed once
 *  at LSX approval (BUG-086 fix, 2026-08-26) — same concept as ItemIssue.requiredQty in
 *  item.type.ts, different seed (SL Job here vs. 1 unit of the root item there). No
 *  `id`/`itemId`/`unitQty`/`image` on this DTO. */
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

/** Mirrors the backend's `production_job_logs.action` — cố ý không trùng tên
 *  `ProductionJobStatus` (`CREATED`/`STARTED` thay cho `PENDING`/`IN_PROGRESS`). Chỉ 2 giá trị đó
 *  là hành động của người dùng; 3 giá trị còn lại là mốc chuyển tự động, không có actor. */
export enum ProductionJobLogAction {
  CREATED = "CREATED",
  STARTED = "STARTED",
  WAITING_QC = "WAITING_QC",
  WAITING_DELIVERY = "WAITING_DELIVERY",
  COMPLETED = "COMPLETED",
}

// Động từ mô tả hành động vừa xảy ra — khác `productionJobStatusLabels` phía trên (danh từ trạng
// thái hiện tại), cùng tinh thần `productionOrderLogActionLabels`.
export const productionJobLogActionLabels: Record<
  ProductionJobLogAction,
  string
> = {
  [ProductionJobLogAction.CREATED]: "Tạo Job",
  [ProductionJobLogAction.STARTED]: "Bắt đầu SX",
  [ProductionJobLogAction.WAITING_QC]: "Chuyển chờ QC",
  [ProductionJobLogAction.WAITING_DELIVERY]: "Chuyển chờ giao hàng",
  [ProductionJobLogAction.COMPLETED]: "Hoàn thành Job",
}

/** Mirrors the backend's UserRefResDto nested in ProductionJobLogResDto. */
export type ProductionJobLogPerformerRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's ProductionJobLogResDto (`GET /production-jobs/:jobId/logs`, paginated,
 *  sorted desc(createdAt) — audit log thật, khác `ProductionJobNote` (hội thoại tự do, asc)).
 *  `content` là câu tiếng Việt dựng sẵn ở backend lúc ghi — không tự suy diễn/dựng câu ở đây.
 *  `performerBy` NULL nghĩa là mốc tự động (không có actor), không phải user bị xoá. */
export type ProductionJobLog = {
  id: string
  action: ProductionJobLogAction
  content: string
  performerBy: ProductionJobLogPerformerRef | null
  createdAt: string
}

/** Mirrors `GET /production-execution/operations` — một dòng / công đoạn có ít nhất 1 Job khớp
 *  filter, dùng để dựng dãy thẻ "CHỌN CÔNG ĐOẠN". `jobCount` đếm số Job phân biệt, không phải số
 *  dòng (Job × Part). */
export type ProductionOperationSummary = {
  operationId: string
  code: string
  name: string
  type: OperationType
  jobCount: number
}

/** Trạng thái tiến độ của MỘT công đoạn trên MỘT Job — gộp qua mọi part của Job có công đoạn đó
 *  (`ProductionJobByOperation.operationStatus` bên dưới). Khác `OperationProgressStatus` cục bộ
 *  của `ProductionJobOperationsTable.tsx` (trạng thái một dòng công đoạn/part đơn lẻ, nhãn khác:
 *  "Chưa bắt đầu"/"Đang thực hiện"/"Hoàn thành") — đây là mức Job, đúng 3 nhãn trong khung "GHI
 *  CHÚ" của màn "Thực hiện sản xuất". */
export type ProductionOperationProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DONE"

export const productionOperationProgressStatusLabels: Record<
  ProductionOperationProgressStatus,
  string
> = {
  NOT_STARTED: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  DONE: "Hoàn thành",
}

/** Mirrors `GET /production-execution/jobs` — một dòng / (Job × công đoạn), số lượng gộp (SUM)
 *  qua mọi part của Job có công đoạn đó. Nguồn cho bảng "DANH SÁCH CÔNG VIỆC" của màn "Thực hiện
 *  sản xuất". */
export type ProductionJobByOperation = {
  jobId: string
  jobCode: string
  orderCode: string
  item: { code: string; name: string }
  quantity: number
  orderDate: string
  dueDate: string | null
  jobStatus: ProductionJobStatus
  plannedQuantity: number
  completedQuantity: number
  rejectedQuantity: number
  operationCompletedDate: string | null
  operationStatus: ProductionOperationProgressStatus
}

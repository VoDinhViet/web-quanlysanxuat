import type { FileResource } from "@/lib/types/file.type"
import type { OperationType } from "@/lib/types/operation.type"
import type { OrderClientRef, OrderRef } from "@/lib/types/order.type"
import type { ProductRef } from "@/lib/types/product.type"

/** Mirrors the backend's real `production_jobs.status` column (`GET /production-jobs`,
 *  `GET /production-jobs/:jobId`). Rút còn 2 giá trị 2026-08-01 theo yêu cầu nghiệp vụ — không
 *  còn `WAITING`, một chiều `PENDING → IN_PROGRESS`, không có đường lùi và không có điểm kết
 *  thúc nào khác `IN_PROGRESS` (xem `src/database/schemas/production.ts`, backend). */
export enum ProductionJobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
}

export const PRODUCTION_JOB_STATUS_LABELS: Record<ProductionJobStatus, string> =
  {
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
 *  the parent order, its client and the FG product (`OrderBaseResDto`/`ClientBaseResDto`/
 *  `ProductBaseResDto` server-side, 2026-08-01). `productionOrderId` has no matching LSX code on
 *  this endpoint — the detail screen links to the LSX by id instead of rendering its code. */
export type ProductionJobDetail = {
  id: string
  code: string
  productionOrderId: string
  order: OrderRef
  // Cùng một dòng `clients` với `order.client` (service leftJoin `clients` trên
  // `orders.client_id`) — backend expose ở cả 2 chỗ; UI đọc field top-level này.
  client: OrderClientRef | null
  productId: string
  product: ProductRef
  quantity: number
  status: ProductionJobStatus
  startedBy: string | null
  startedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's ProductionJobStepResDto (`GET /production-jobs/:jobId/steps`) — the
 *  Job's routing snapshot, one row per operation in sequence. No plannedQty/doneQty/sentQty/
 *  receivedQty and no part grouping — `production_job_steps` only stores the operation + note. */
export type ProductionJobStep = {
  id: string
  sortOrder: number
  note: string | null
  operation: { id: string; code: string; name: string; type: OperationType }
  createdAt: string
}

/** Mirrors the backend's ProductionJobMaterialResDto (`GET /production-jobs/:jobId/materials`,
 *  paginated). `issuedQty` has no equivalent here (no stock-issue linkage on this endpoint) — the
 *  BOM tab renders that column as "Chưa có API" via MissingFieldValue. */
export type ProductionJobMaterial = {
  materialId: string
  code: string
  name: string
  unit: { id: string; code: string; name: string }
  image: FileResource | null
  unitQty: number | null
  requiredQty: number
}

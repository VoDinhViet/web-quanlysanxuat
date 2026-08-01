import type { FileResource } from "@/lib/types/file.type"
import type { OperationType } from "@/lib/types/operation.type"
import type { OrderClientRef } from "@/lib/types/order.type"

/** Mirrors the backend's real `production_jobs.status` column (`GET /production-jobs`,
 *  `GET /production-jobs/:jobId`). Rút từ 5 xuống 3 giá trị 2026-07-31 theo yêu cầu nghiệp vụ (xưởng
 *  chỉ cần "Chưa SX"/"Đang SX"/"Chờ Sản Xuất") — không còn điểm kết thúc, `WAITING` quay lại
 *  `IN_PROGRESS` được (`resumeJob`). `PENDING → IN_PROGRESS ⇄ WAITING`. */
export enum ProductionJobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING = "WAITING",
}

export const PRODUCTION_JOB_STATUS_LABELS: Record<ProductionJobStatus, string> =
  {
    [ProductionJobStatus.PENDING]: "Chưa SX",
    [ProductionJobStatus.IN_PROGRESS]: "Đang SX",
    [ProductionJobStatus.WAITING]: "Chờ Sản Xuất",
  }

/** Mirrors the backend's ProductionJobResDto — one row of `GET /production-jobs`, the "Quản lý
 *  sản xuất" screen. Split off from the detail shape 2026-07-31: the list only carries the columns
 *  the table needs, not the full Job (no `product` object, `rejectedQty`, `remainingQty`,
 *  `startedAt`, `approver`, `approvedAt` — those are `GET /production-jobs/:jobId`-only). */
export type ProductionJob = {
  id: string
  code: string
  orderCode: string
  client: OrderClientRef | null
  image: FileResource | null
  quantity: number
  orderDate: string
  dueDate: string | null
  // Trễ hạn giao hàng mà sản xuất chưa đủ số (dueDate < now && producedQty + rejectedQty <
  // quantity) — computed server-side in SQL, not derived here: `status` alone can't tell "chưa
  // xong" apart since the 3-value enum has no terminal state (a fully-reported Job still reads
  // IN_PROGRESS).
  warning: boolean
  producedQty: number
  status: ProductionJobStatus
}

/** Mirrors the backend's ProductionJobDetailResDto (`GET /production-jobs/:jobId`) — a
 *  deliberately thin, unjoined row of the `production_jobs` table (see the service's own
 *  comment: "Không join — thông tin PO/khách hàng/sản phẩm FE lấy từ dòng tương ứng ở
 *  getProductionJobs"). `lsxCode`/`productName`/`clientName`/`poNumber`/`dueDate`/`producedQty`
 *  from the old UI-only mock have no source here — the detail screen renders those fields as
 *  "Chưa có API" via MissingFieldValue instead of trying to reconstruct them from other calls. */
export type ProductionJobDetail = {
  id: string
  code: string
  productionOrderId: string
  productId: string
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

import type { FileResource } from "@/lib/types/file.type"
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

// Per-step status for the Job detail screen's "Công đoạn sản xuất" tab (GET
// /production-jobs/:jobId, not shipped yet — see production-job-detail.mock.ts). Distinct from
// ProductionJobStatus above: that one tracks the whole Job, these track one routing step's own
// progress, derived client-side from its planned/done quantities rather than stored as a column.
export enum ProductionStepStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export const PRODUCTION_STEP_STATUS_LABELS: Record<
  ProductionStepStatus,
  string
> = {
  [ProductionStepStatus.NOT_STARTED]: "Chưa thực hiện",
  [ProductionStepStatus.IN_PROGRESS]: "Đang thực hiện",
  [ProductionStepStatus.DONE]: "Hoàn thành",
}

// An in-house step: doneQty >= plannedQty is DONE even if a keystroke briefly overshoots it.
export function resolveProductionStepStatus(
  plannedQty: number,
  doneQty: number
): ProductionStepStatus {
  if (doneQty >= plannedQty) return ProductionStepStatus.DONE
  if (doneQty > 0) return ProductionStepStatus.IN_PROGRESS
  return ProductionStepStatus.NOT_STARTED
}

export enum OutsourceStepStatus {
  NOT_SENT = "NOT_SENT",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export const OUTSOURCE_STEP_STATUS_LABELS: Record<OutsourceStepStatus, string> =
  {
    [OutsourceStepStatus.NOT_SENT]: "Chưa gửi",
    [OutsourceStepStatus.IN_PROGRESS]: "Đang gia công",
    [OutsourceStepStatus.DONE]: "Hoàn thành",
  }

// An outsourced step: received >= planned is DONE regardless of sent; sent = 0 means it hasn't
// left the shop yet.
export function resolveOutsourceStepStatus(
  plannedQty: number,
  sentQty: number,
  receivedQty: number
): OutsourceStepStatus {
  if (receivedQty >= plannedQty) return OutsourceStepStatus.DONE
  if (sentQty > 0) return OutsourceStepStatus.IN_PROGRESS
  return OutsourceStepStatus.NOT_SENT
}

// Placeholder data for the Job detail screen (task 8.2) — same idea as
// src/features/orders/mock/order-detail.mock.ts, but hardcoded (not faker-seeded) to match a
// specific approved mockup 1:1. Delete these types once the backend ships
// GET /production-jobs/:jobId and its sub-resources.
export type ProductionJobMockInhouseStep = {
  id: string
  name: string
  plannedQty: number
  doneQty: number
  completedAt: string | null
  note: string | null
}

export type ProductionJobMockPart = {
  code: string
  name: string
  steps: ProductionJobMockInhouseStep[]
}

export type ProductionJobMockOutsourceRow = {
  id: string
  partCode: string
  partName: string
  operationName: string
  plannedQty: number
  sentQty: number
  receivedQty: number
  note: string | null
}

export type ProductionJobMockMaterial = {
  id: string
  code: string
  name: string
  unitName: string
  normQty: number
  requiredQty: number
  issuedQty: number
}

export type ProductionJobMockDocument = {
  id: string
  name: string
  sizeLabel: string
  uploadedAt: string
}

export type ProductionJobMockNote = {
  id: string
  authorName: string
  createdAt: string
  content: string
}

export type ProductionJobMockLog = {
  id: string
  performedAt: string
  actorName: string
  action: string
  content: string
}

// The Job detail screen's full hardcoded payload — one Job, matching the approved mockup.
export type ProductionJobMockDetail = {
  code: string
  lsxCode: string
  productName: string
  clientName: string
  quantity: number
  producedQty: number
  poNumber: string
  createdAt: string
  dueDate: string
  status: ProductionJobStatus
  inhouseParts: ProductionJobMockPart[]
  outsourceRows: ProductionJobMockOutsourceRow[]
  materials: ProductionJobMockMaterial[]
  documents: ProductionJobMockDocument[]
  notes: ProductionJobMockNote[]
  logs: ProductionJobMockLog[]
}

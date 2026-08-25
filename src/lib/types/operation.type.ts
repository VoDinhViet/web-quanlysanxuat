import type { UserRef } from "@/lib/types/user.type"

export enum OperationType {
  INHOUSE = "INHOUSE",
  OUTSOURCE = "OUTSOURCE",
}

export enum OperationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const operationTypeLabels: Record<OperationType, string> = {
  [OperationType.INHOUSE]: "Inhouse",
  [OperationType.OUTSOURCE]: "Outsource",
}

export const operationStatusLabels: Record<OperationStatus, string> = {
  [OperationStatus.ACTIVE]: "Đang dùng",
  [OperationStatus.INACTIVE]: "Ngừng dùng",
}

/**
 * Mirrors backend's OperationResDto / OperationRefResDto — the master catalog operation entity.
 */
export type Operation = {
  id: string
  code: string
  name: string
  type: OperationType
}

/** Legacy alias for backward compatibility */
export type OperationRef = Operation

/**
 * Mirrors backend's OperationResDto (GET/POST/PATCH /operations) — the full catalogue record for
 * the management screen. Deliberately separate from `Operation`/`OperationRef` above, which stay
 * the narrow picker shape consumed by BOM/routing steps — widening those would ripple into every
 * consumer that only needs id/code/name/type.
 */
export type OperationDetail = {
  id: string
  code: string
  name: string
  type: OperationType
  note: string | null
  status: OperationStatus
  creatorBy: UserRef
  createdAt: string
  updatedAt: string
}

/**
 * Mirrors backend's ProductOperationResDto / BomOperationResDto — one step of a product or BOM item routing.
 */
export type ProductOperation = {
  id: string
  sortOrder: number
  note: string | null
  operation: Operation
  createdAt: string
  updatedAt: string
}

/**
 * Format a routing's steps into a single line, e.g.
 * "1. Tiện CNC → 2. Phay CNC".
 */
export function formatOperationSequence(
  operations: ProductOperation[]
): string {
  if (operations.length === 0) return "—"
  return operations
    .map((step, idx) => `${idx + 1}. ${step.operation.name}`)
    .join(" → ")
}

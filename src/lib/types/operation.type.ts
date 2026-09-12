import type { UserRef } from "@/lib/types/user.type"

export const OperationType = {
  INHOUSE: "INHOUSE",
  OUTSOURCE: "OUTSOURCE",
} as const

export type OperationType = (typeof OperationType)[keyof typeof OperationType]

export enum OperationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const operationTypeLabels: Record<OperationType, string> = {
  [OperationType.INHOUSE]: "Trong nhà",
  [OperationType.OUTSOURCE]: "Gia công ngoài",
}

export const operationStatusLabels: Record<OperationStatus, string> = {
  [OperationStatus.ACTIVE]: "Đang dùng",
  [OperationStatus.INACTIVE]: "Ngừng dùng",
}

/**
 * Mirrors backend's OperationResDto / OperationRefResDto — the master catalog operation entity.
 * No `type` here — Inhouse/Outsource isn't a fixed catalog attribute, it's chosen per BOM
 * attachment (see `ProductOperation` below).
 */
export type Operation = {
  id: string
  code: string
  name: string
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
  note: string | null
  status: OperationStatus
  creatorBy: UserRef
  createdAt: string
  updatedAt: string
}

/**
 * Mirrors backend's RoutingOperationResDto / BomOperationResDto — one step of a product or BOM item
 * routing. `type` is chosen per attachment (the same catalog operation can be Inhouse on one
 * routing and Outsource on another) — it's a top-level sibling of `operation`, matching the
 * create/update DTOs (`CreateOperationInput` etc. in use-product-operations.ts), which also take
 * `type` as a sibling of `operationId`, not nested under it.
 */
export type ProductOperation = {
  id: string
  sortOrder: number
  note: string | null
  type: OperationType
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

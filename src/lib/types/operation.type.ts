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
  [OperationType.INHOUSE]: "Nội bộ",
  [OperationType.OUTSOURCE]: "Gia công ngoài",
}

export const operationStatusLabels: Record<OperationStatus, string> = {
  [OperationStatus.ACTIVE]: "Đang dùng",
  [OperationStatus.INACTIVE]: "Ngừng dùng",
}

/**
 * Nested ref in a routing/BOM step. It carries no type: the step's own `type` applies (see
 * `ProductOperation`). The catalog type lives on `OperationRef` and `OperationDetail`.
 */
export type Operation = {
  id: string
  code: string
  name: string
}

/** Mirrors backend's OperationRefResDto (GET /operations/options), the picker row. */
export type OperationRef = Operation & {
  type: OperationType
}

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
  creatorBy: UserRef | null
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

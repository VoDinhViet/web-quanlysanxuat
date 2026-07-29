export enum OperationType {
  INHOUSE = "INHOUSE",
  OUTSOURCE = "OUTSOURCE",
}

export enum OperationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  INHOUSE: "Inhouse",
  OUTSOURCE: "Outsource",
}

/** Mirrors the backend's OperationRefResDto — the master operation
 *  (@/api/operations) a routing step points at. */
export type OperationRef = {
  id: string
  code: string
  name: string
  type: OperationType
}

/**
 * Mirrors the backend's ProductOperationResDto — one step of a product's
 * routing (GET/POST/PATCH /api/products/:productId/operations). Routing is
 * scoped to the whole product, not to individual BOM lines.
 */
export type Operation = {
  id: string
  sortOrder: number
  note: string | null
  type: OperationType
  operation: OperationRef
  createdAt: string
  updatedAt: string
}

/**
 * Format a routing's steps into a single line, e.g.
 * "1. Tiện CNC → 2. Phay CNC".
 */
export function formatOperationSequence(operations: Operation[]): string {
  if (operations.length === 0) return "—"
  return operations
    .map((step, idx) => `${idx + 1}. ${step.operation.name}`)
    .join(" → ")
}

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

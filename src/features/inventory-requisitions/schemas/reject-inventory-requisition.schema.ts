import { z } from "zod"

// Wire contract for POST /api/inventory-requisitions/:requisitionId/reject — shared by
// RejectRequisitionDialog's form and the server function's validator, same 1000-char cap as
// reject-purchase-quotation.schema.ts.
export const rejectInventoryRequisitionSchema = z.object({
  requisitionId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectInventoryRequisitionSchema = z.infer<
  typeof rejectInventoryRequisitionSchema
>

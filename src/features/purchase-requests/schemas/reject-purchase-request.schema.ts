import { z } from "zod"

// Wire contract for POST /api/purchase-requests/:purchaseRequestId/reject — shared by
// RejectPurchaseRequestDialog's form and the server function's validator (the backend requires a
// non-empty reason, same 1000-char cap as orders' reject-order.schema.ts).
export const rejectPurchaseRequestSchema = z.object({
  purchaseRequestId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectPurchaseRequestSchema = z.infer<
  typeof rejectPurchaseRequestSchema
>

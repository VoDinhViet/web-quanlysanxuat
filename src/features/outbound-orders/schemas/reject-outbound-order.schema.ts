import { z } from "zod"

// Wire contract for POST /api/outbound-orders/:outboundOrderId/reject — shared by
// OutboundOrderRejectDialog's form and the server function's validator (backend requires a
// non-empty reason, same 1000-char cap as purchase-requests' reject-purchase-request.schema.ts).
export const rejectOutboundOrderSchema = z.object({
  outboundOrderId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectOutboundOrderSchema = z.infer<
  typeof rejectOutboundOrderSchema
>

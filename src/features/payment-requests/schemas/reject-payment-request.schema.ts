import { z } from "zod"

// Wire contract for POST /api/payment-requests/:paymentRequestId/reject — shared by
// PaymentRequestRejectDialog's form and the server function's validator, same 1000-char cap as
// cancel-payment-request.schema.ts.
export const rejectPaymentRequestSchema = z.object({
  paymentRequestId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectPaymentRequestSchema = z.infer<
  typeof rejectPaymentRequestSchema
>

import { z } from "zod"

// Wire contract for POST /api/payment-requests/:paymentRequestId/cancel — shared by
// PaymentRequestCancelDialog's form and the server function's validator, same 1000-char cap as
// cancel-purchase-order.schema.ts.
export const cancelPaymentRequestSchema = z.object({
  paymentRequestId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do huỷ")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type CancelPaymentRequestSchema = z.infer<
  typeof cancelPaymentRequestSchema
>

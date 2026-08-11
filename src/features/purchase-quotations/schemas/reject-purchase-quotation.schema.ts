import { z } from "zod"

// Wire contract for POST /api/purchase-quotations/:quotationId/reject — shared by
// RejectQuotationDialog's form and the server function's validator, same 1000-char cap as
// reject-purchase-request.schema.ts.
export const rejectPurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectPurchaseQuotationSchema = z.infer<
  typeof rejectPurchaseQuotationSchema
>

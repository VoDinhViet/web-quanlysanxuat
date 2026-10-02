import { z } from "zod"

// Wire contract for POST /api/purchase-quotations/:quotationId/cancel — shared by
// CancelQuotationDialog's form and the server function's validator.
export const cancelPurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do hủy")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type CancelPurchaseQuotationSchema = z.infer<
  typeof cancelPurchaseQuotationSchema
>

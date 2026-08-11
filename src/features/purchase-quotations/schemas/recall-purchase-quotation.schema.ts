import { z } from "zod"

// Wire contract for POST /api/purchase-quotations/:quotationId/recall — no request body.
export const recallPurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.uuid(),
})

export type RecallPurchaseQuotationSchema = z.infer<
  typeof recallPurchaseQuotationSchema
>

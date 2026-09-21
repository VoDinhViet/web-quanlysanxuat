import { z } from "zod"

// Wire contract for POST /api/purchase-quotations/:quotationId/send — no request body, the
// backend derives everything from the id + caller.
export const sendPurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.uuid(),
})

export type SendPurchaseQuotationSchema = z.infer<
  typeof sendPurchaseQuotationSchema
>

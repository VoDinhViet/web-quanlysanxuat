import { z } from "zod"

export const deletePurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.string().uuid(),
})

export type DeletePurchaseQuotationSchema = z.infer<
  typeof deletePurchaseQuotationSchema
>

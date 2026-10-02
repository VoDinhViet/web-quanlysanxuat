import { z } from "zod"

// Wire contract for POST /api/purchase-requests/:purchaseRequestId/items — the server function's
// validator. The dialog builds its payload from plain wizard state, so there is no form schema.
export const createPurchaseRequestItemsSchema = z.object({
  purchaseRequestId: z.uuid(),
  items: z
    .array(
      z.object({
        itemId: z.uuid(),
        quantity: z.number().positive("Số lượng phải lớn hơn 0"),
      })
    )
    .min(1, "Vui lòng chọn ít nhất một vật tư"),
})

export type CreatePurchaseRequestItemsSchema = z.infer<
  typeof createPurchaseRequestItemsSchema
>

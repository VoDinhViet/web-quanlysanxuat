import { z } from "zod"

// Wire contract for POST /api/purchase-orders/:purchaseOrderId/close — shared by
// PurchaseOrderCloseDialog's form and the server function's validator, same 1000-char cap as
// cancel-purchase-order.schema.ts.
export const closePurchaseOrderSchema = z.object({
  purchaseOrderId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do đóng sớm")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type ClosePurchaseOrderSchema = z.infer<typeof closePurchaseOrderSchema>

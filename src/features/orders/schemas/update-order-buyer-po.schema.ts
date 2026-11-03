import { z } from "zod"

// Wire contract for PATCH /api/orders/:orderId/buyer-po — shared by OrderBuyerPoInlineEdit's
// input and the server function's validator (the backend requires a non-empty PO, max 100).
export const updateOrderBuyerPoSchema = z.object({
  orderId: z.uuid(),
  buyerPoNo: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số PO")
    .max(100, "Số PO tối đa 100 ký tự"),
})

export type UpdateOrderBuyerPoSchema = z.infer<typeof updateOrderBuyerPoSchema>

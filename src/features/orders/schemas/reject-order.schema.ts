import { z } from "zod"

// Wire contract for POST /api/orders/:orderId/reject — shared by RejectOrderDialog's form
// and the server function's validator (the backend requires a non-empty reason).
export const rejectOrderSchema = z.object({
  orderId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectOrderSchema = z.infer<typeof rejectOrderSchema>

import { z } from "zod"

// Wire contract for POST /api/outsourcing-orders/:outsourcingOrderId/reject — shared by
// RejectOutsourcingOrderDialog's form and the server function's validator.
export const rejectOutsourcingOrderSchema = z.object({
  outsourcingOrderId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectOutsourcingOrderSchema = z.infer<
  typeof rejectOutsourcingOrderSchema
>

import { z } from "zod"

// Wire contract for POST /api/ncrs/:ncrId/reject — also the RejectNcrDialog's validator.
export const rejectNcrSchema = z.object({
  ncrId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do không duyệt")
    .max(1000, "Lý do tối đa 1000 ký tự"),
})

export type RejectNcrSchema = z.infer<typeof rejectNcrSchema>

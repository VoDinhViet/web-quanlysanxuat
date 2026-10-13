import { z } from "zod"

// Wire contract for POST /api/ncrs/:ncrId/oqc — `quantity` omitted = SL sửa chữa + làm mới.
export const requestNcrOqcSchema = z.object({
  ncrId: z.uuid(),
  quantity: z.number().positive("SL phải lớn hơn 0").optional(),
})

export type RequestNcrOqcSchema = z.input<typeof requestNcrOqcSchema>

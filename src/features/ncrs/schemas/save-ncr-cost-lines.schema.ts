import { z } from "zod"

import { NcrCostKind } from "@/lib/types/ncr.type"

// Wire contract for PUT /api/ncrs/:ncrId/cost-lines — replaces every cost line of the NCR.
export const ncrCostLineSchema = z.object({
  kind: z.enum(NcrCostKind),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập diễn giải")
    .max(500, "Tối đa 500 ký tự"),
  itemId: z.uuid().optional(),
  quantity: z.number().min(0, "SL không được âm"),
  unitPrice: z.number().min(0, "Đơn giá không được âm"),
})

export const saveNcrCostLinesSchema = z.object({
  ncrId: z.uuid(),
  lines: z.array(ncrCostLineSchema),
})

export type NcrCostLineSchema = z.infer<typeof ncrCostLineSchema>
export type SaveNcrCostLinesSchema = z.infer<typeof saveNcrCostLinesSchema>

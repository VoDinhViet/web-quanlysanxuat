import { z } from "zod"

import { ItemStatus } from "@/lib/types/item.type"

// Lightweight wire contract for the row-level "Ngừng sử dụng" / "Kích hoạt lại"
// quick action — a partial PATCH /api/items/:id with only `status` (the
// backend's UpdateItemReqDto makes every field optional), so it doesn't
// require re-validating the full profile like the update form does.
export const updateMaterialStatusSchema = z.object({
  materialId: z.uuid(),
  status: z.enum(ItemStatus),
})

export type UpdateMaterialStatusSchema = z.infer<
  typeof updateMaterialStatusSchema
>

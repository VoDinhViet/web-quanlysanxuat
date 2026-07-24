import { z } from "zod"

import { MaterialStatus } from "@/features/materials/types/material.type"

// Lightweight wire contract for the row-level "Ngừng sử dụng" / "Kích hoạt lại"
// quick action — a partial PATCH /api/materials/:id with only `status` (the
// backend's UpdateMaterialReqDto makes every field optional), so it doesn't
// require re-validating the full profile like the update form does.
export const updateMaterialStatusSchema = z.object({
  materialId: z.uuid(),
  status: z.enum(MaterialStatus),
})

export type UpdateMaterialStatusSchema = z.infer<
  typeof updateMaterialStatusSchema
>

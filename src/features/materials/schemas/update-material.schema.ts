import { z } from "zod"

import {
  materialProfileFields,
  refineMaterialClient,
} from "@/features/materials/schemas/create-material.schema"

// Wire contract for PATCH /api/materials/:id — same profile fields as create
// (`code` is immutable and was never part of materialProfileFields), plus the
// id to route the request.
export const updateMaterialSchema = z
  .object({
    materialId: z.uuid(),
    ...materialProfileFields,
  })
  .superRefine(refineMaterialClient)

export type UpdateMaterialSchema = z.input<typeof updateMaterialSchema>

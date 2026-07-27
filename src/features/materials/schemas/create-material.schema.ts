import { z } from "zod"

import {
  materialProfileFields,
  refineMaterialClient,
} from "@/features/materials/schemas/material-form.schema"

// Wire contract for POST /api/materials — same profile fields as
// materialFormSchema (`code` is intentionally omitted — the backend
// auto-generates VTxxxx when omitted).
export const createMaterialSchema = z
  .object(materialProfileFields)
  .superRefine(refineMaterialClient)

export type CreateMaterialSchema = z.input<typeof createMaterialSchema>

import { z } from "zod"

import {
  MaterialStatus,
  MaterialType,
} from "@/features/materials/types/material.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"

// Mirrors the backend's GetMaterialsReqDto (page, limit, q, order inherited from
// PageOptionsDto; type/materialGroupId/clientId/status are material-specific filters).
export const materialsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  type: z.enum(MaterialType).optional().catch(undefined),
  materialGroupId: z.string().trim().min(1).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(MaterialStatus).optional().catch(undefined),
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
})

export type MaterialsSearchSchema = z.infer<typeof materialsSearchSchema>

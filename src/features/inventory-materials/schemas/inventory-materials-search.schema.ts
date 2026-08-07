import { z } from "zod"

import { InventoryStatus } from "@/lib/types/inventory-material.type"

// Mirrors the backend's GetInventoryMaterialsReqDto. Uses `.catch()` on every
// field so a hand-mangled URL degrades gracefully instead of throwing and
// taking the route down.
export const inventoryMaterialsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  materialGroupId: z.string().trim().min(1).optional().catch(undefined),
  materialTypeId: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  warehouseId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(InventoryStatus).optional().catch(undefined),
  dateMode: z.enum(["current", "range"]).optional().catch(undefined),
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type InventoryMaterialsSearchSchema = z.infer<
  typeof inventoryMaterialsSearchSchema
>

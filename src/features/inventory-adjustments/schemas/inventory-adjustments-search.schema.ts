import { z } from "zod"

import {
  InventoryAdjustmentReason,
  InventoryAdjustmentStatus,
  InventoryAdjustmentType,
} from "@/lib/types/inventory-adjustment.type"

// Mirrors the backend's GetInventoryAdjustmentsReqDto (GET /api/inventory-adjustments).
export const inventoryAdjustmentsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  adjustmentType: z.enum(InventoryAdjustmentType).optional().catch(undefined),
  reason: z.enum(InventoryAdjustmentReason).optional().catch(undefined),
  status: z.enum(InventoryAdjustmentStatus).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryAdjustmentsSearchSchema = z.infer<
  typeof inventoryAdjustmentsSearchSchema
>

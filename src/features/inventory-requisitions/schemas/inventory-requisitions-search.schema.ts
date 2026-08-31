import { z } from "zod"

import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"

// Chỉ 2 field: BE (`GetInventoryRequisitionsReqDto`) chỉ hỗ trợ lọc `q` (khớp mã phiếu, unaccent
// ILIKE trên `code`) và `status` — không có param cho tên vật tư, PO/lý do, Job hay bộ phận.
export const inventoryRequisitionsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu lãnh
  status: z.enum(InventoryRequisitionStatus).optional().catch(undefined),
})

export type InventoryRequisitionsSearchSchema = z.infer<
  typeof inventoryRequisitionsSearchSchema
>

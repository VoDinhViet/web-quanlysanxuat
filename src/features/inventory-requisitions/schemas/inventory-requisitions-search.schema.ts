import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"

// Chỉ 2 field: BE (`GetInventoryRequisitionsReqDto`) chỉ hỗ trợ lọc `q` (khớp mã phiếu, unaccent
// ILIKE trên `code`) và `status` — không có param cho tên vật tư, PO/lý do, Job hay bộ phận.
export const inventoryRequisitionsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu lãnh
  status: z.enum(InventoryRequisitionStatus).optional().catch(undefined),
})

export type InventoryRequisitionsSearchSchema = z.infer<
  typeof inventoryRequisitionsSearchSchema
>

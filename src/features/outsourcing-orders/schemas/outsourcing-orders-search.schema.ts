import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-order.type"

export const outsourcingOrdersSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu, NCC, công đoạn
  status: z
    .enum([InventoryDocumentStatus.POSTED, InventoryDocumentStatus.CANCELLED])
    .optional()
    .catch(undefined),
})

export type OutsourcingOrdersSearchSchema = z.infer<
  typeof outsourcingOrdersSearchSchema
>

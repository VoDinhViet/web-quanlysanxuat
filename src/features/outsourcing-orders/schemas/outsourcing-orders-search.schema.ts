import { z } from "zod"

import { InventoryDocumentStatus } from "@/lib/types/outsourcing-order.type"

export const outsourcingOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu, NCC, công đoạn
  status: z
    .enum([InventoryDocumentStatus.POSTED, InventoryDocumentStatus.CANCELLED])
    .optional()
    .catch(undefined),
})

export type OutsourcingOrdersSearchSchema = z.infer<
  typeof outsourcingOrdersSearchSchema
>

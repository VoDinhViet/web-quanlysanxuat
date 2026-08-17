import { z } from "zod"

import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"

// Mirrors the backend's GetOutsourcingReceiptsReqDto (GET /api/outsourcing-receipts). Every
// optional field carries `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of
// taking the route down. `outsourcingOrderId` isn't here — filtering by a specific OS-OUT needs a
// picker this round doesn't build (list+detail+actions only, no OS-OUT detail route to link back
// from anyway). `order` isn't here either: the DTO inherits it from PageOptionsDto but the service
// hardcodes `orderBy: desc(outsourcingReceipts.createdAt)`, same as supplier-returns-search.schema.ts.
export const outsourcingReceiptsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  materialKeyword: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  warehouseId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(InventoryDocumentStatus).optional().catch(undefined),
  requiresIqc: z.boolean().optional().catch(undefined),
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OutsourcingReceiptsSearchSchema = z.infer<
  typeof outsourcingReceiptsSearchSchema
>

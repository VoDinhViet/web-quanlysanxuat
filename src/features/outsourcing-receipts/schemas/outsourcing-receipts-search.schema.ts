import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"

// Mirrors the backend's GetOutsourcingReceiptsReqDto (GET /api/outsourcing-receipts). Every
// optional field carries `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of
// taking the route down. `outsourcingOrderId` isn't here — filtering by a specific OS-OUT needs a
// picker this round doesn't build (list+detail+actions only, no OS-OUT detail route to link back
// from anyway). `order` isn't here either: the DTO inherits it from PageOptionsDto but the service
// hardcodes `orderBy: desc(outsourcingReceipts.createdAt)`, same as supplier-returns-search.schema.ts.
// `q` (not `materialKeyword` — BE has no such param) matches `outsourcingReceipts.code` only, not
// material name/code. `status` narrowed to POSTED/CANCELLED literals — BE's own
// `OutsourcingReceiptStatus` enum never produces DRAFT (docs/decisions/outsourcing-no-draft.md),
// and its `@EnumFieldOptional` validator 400s on any other value.
export const outsourcingReceiptsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  status: z
    .enum([InventoryDocumentStatus.POSTED, InventoryDocumentStatus.CANCELLED])
    .optional()
    .catch(undefined),
  requiresIqc: z.boolean().optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OutsourcingReceiptsSearchSchema = z.infer<
  typeof outsourcingReceiptsSearchSchema
>

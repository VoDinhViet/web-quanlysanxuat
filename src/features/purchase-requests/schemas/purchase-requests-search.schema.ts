import { z } from "zod"

import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import { isoDateFilter } from "@/lib/zod-transforms"

export const purchaseRequestsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseRequestStatus).optional().catch(undefined),
  departmentId: z.string().trim().min(1).optional().catch(undefined),
  createdStartDate: isoDateFilter,
  createdEndDate: isoDateFilter,
})

export type PurchaseRequestsSearchSchema = z.infer<
  typeof purchaseRequestsSearchSchema
>

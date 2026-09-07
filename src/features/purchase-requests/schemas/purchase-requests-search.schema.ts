import { z } from "zod"

import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

export const purchaseRequestsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseRequestStatus).optional().catch(undefined),
  departmentId: z.string().trim().min(1).optional().catch(undefined),
  createdStartDate: z.iso.date().optional().catch(undefined),
  createdEndDate: z.iso.date().optional().catch(undefined),
})

export type PurchaseRequestsSearchSchema = z.infer<
  typeof purchaseRequestsSearchSchema
>

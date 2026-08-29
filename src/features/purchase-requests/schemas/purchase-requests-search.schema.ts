import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import { isoDateFilter } from "@/lib/zod-transforms"

export const purchaseRequestsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseRequestStatus).optional().catch(undefined),
  departmentId: z.string().trim().min(1).optional().catch(undefined),
  createdStartDate: isoDateFilter,
  createdEndDate: isoDateFilter,
})

export type PurchaseRequestsSearchSchema = z.infer<
  typeof purchaseRequestsSearchSchema
>

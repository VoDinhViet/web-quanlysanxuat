import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import {
  InventoryIssueStatus,
  InventoryIssueType,
} from "@/lib/types/inventory-issue.type"

export const inventoryIssuesSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  warehouseId: z.string().trim().min(1).optional().catch(undefined),
  issueType: z.enum(InventoryIssueType).optional().catch(undefined),
  status: z.enum(InventoryIssueStatus).optional().catch(undefined),
  productionOrderId: z.string().trim().min(1).optional().catch(undefined),
  productionJobId: z.string().trim().min(1).optional().catch(undefined),
  departmentId: z.string().trim().min(1).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryIssuesSearchSchema = z.infer<
  typeof inventoryIssuesSearchSchema
>

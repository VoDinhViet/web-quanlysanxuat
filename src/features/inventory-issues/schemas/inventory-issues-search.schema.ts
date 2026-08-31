import { z } from "zod"

import {
  InventoryIssueStatus,
  InventoryIssueType,
} from "@/lib/types/inventory-issue.type"

export const inventoryIssuesSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
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

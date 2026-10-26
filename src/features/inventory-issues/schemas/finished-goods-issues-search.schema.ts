import { inventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"

// Finished-goods issues are always SALES issues, so the type is pinned by the page, not the URL.
export const finishedGoodsIssuesSearchSchema = inventoryIssuesSearchSchema.omit(
  {
    issueType: true,
    productionOrderId: true,
    productionJobId: true,
    departmentId: true,
  }
)

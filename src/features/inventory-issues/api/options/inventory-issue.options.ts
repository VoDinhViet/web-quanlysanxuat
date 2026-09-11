import { queryOptions } from "@tanstack/react-query"

import { getInventoryIssue } from "@/features/inventory-issues/api/server-functions/get-inventory-issue.api"

export const inventoryIssueQueryOptions = (issueId: string) =>
  queryOptions({
    queryKey: ["inventory-issues", "detail", issueId],
    queryFn: () => getInventoryIssue({ data: { issueId } }),
  })

import { queryOptions } from "@tanstack/react-query"

import { getPendingApprovals } from "@/features/reports/api/server-functions/get-pending-approvals.api"

export const pendingApprovalsQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "pending-approvals"],
    queryFn: () => getPendingApprovals(),
  })

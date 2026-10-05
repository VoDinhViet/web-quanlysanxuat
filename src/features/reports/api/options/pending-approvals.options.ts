import { queryOptions } from "@tanstack/react-query"

import { getPendingApprovals } from "@/features/reports/api/server-functions/get-pending-approvals.api"

export const pendingApprovalsQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "pending-approvals"],
    queryFn: () => getPendingApprovals(),
    // Việc chờ do người khác sinh ra (vd. IQC xong → Kho) phải tự hiện khi ERP đang mở, không chờ
    // người dùng chuyển trang.
    refetchInterval: 60_000,
  })

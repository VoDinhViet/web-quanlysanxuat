import { queryOptions } from "@tanstack/react-query"

import { getPurchaseRequest } from "@/features/purchase-requests/api/server-functions/get-purchase-request.api"

export const purchaseRequestQueryOptions = (purchaseRequestId: string) =>
  queryOptions({
    queryKey: ["purchase-requests", "detail", purchaseRequestId],
    queryFn: () => getPurchaseRequest({ data: { purchaseRequestId } }),
  })

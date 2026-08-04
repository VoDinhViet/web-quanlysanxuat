import { queryOptions } from "@tanstack/react-query"

import { getPurchaseRequests } from "@/features/purchase-requests/api/server-functions/get-purchase-requests.api"
import type { PurchaseRequestsSearchSchema } from "@/features/purchase-requests/schemas/purchase-requests-search.schema"

export const purchaseRequestsQueryOptions = (
  search: PurchaseRequestsSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-requests", "list", search],
    queryFn: () => getPurchaseRequests({ data: search }),
  })

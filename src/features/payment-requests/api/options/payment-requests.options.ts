import { queryOptions } from "@tanstack/react-query"

import { getPaymentRequests } from "@/features/payment-requests/api/server-functions/get-payment-requests.api"
import type { PaymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"

// List query — keyed on the full search object so any filter/page change triggers a new fetch,
// same pattern as purchaseOrdersQueryOptions.
export const paymentRequestsQueryOptions = (
  search: PaymentRequestsSearchSchema
) =>
  queryOptions({
    queryKey: ["payment-requests", "list", search],
    queryFn: () => getPaymentRequests({ data: search }),
  })

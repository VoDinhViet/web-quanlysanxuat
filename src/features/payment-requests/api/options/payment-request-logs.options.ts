import { queryOptions } from "@tanstack/react-query"

import { getPaymentRequestLogs } from "@/features/payment-requests/api/server-functions/get-payment-request-logs.api"

// PaymentRequestLogsCard's own pagination — local component state (see the card), not a route
// search param: this route has no other use for page/limit, but the card still owns it directly
// rather than a URL param, same idiom as productionJobLogsQueryOptions.
export const paymentRequestLogsQueryOptions = (
  paymentRequestId: string,
  page: number,
  limit: number
) =>
  queryOptions({
    queryKey: ["payment-requests", "logs", paymentRequestId, page, limit],
    queryFn: () =>
      getPaymentRequestLogs({ data: { paymentRequestId, page, limit } }),
  })

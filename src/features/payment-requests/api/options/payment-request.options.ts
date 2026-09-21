import { queryOptions } from "@tanstack/react-query"

import { getPaymentRequest } from "@/features/payment-requests/api/server-functions/get-payment-request.api"

// Detail query — keyed on the record id.
export const paymentRequestQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["payment-requests", "detail", id],
    queryFn: () => getPaymentRequest({ data: { paymentRequestId: id } }),
  })

import { queryOptions } from "@tanstack/react-query"

import { getOutboundOrder } from "@/features/outbound-orders/api/server-functions/get-outbound-order.api"

export const outboundOrderQueryOptions = (outboundOrderId: string) =>
  queryOptions({
    queryKey: ["outbound-orders", "detail", outboundOrderId],
    queryFn: () => getOutboundOrder({ data: { outboundOrderId } }),
  })

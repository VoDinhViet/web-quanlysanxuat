import { queryOptions } from "@tanstack/react-query"

import { getOutboundOrderItems } from "@/features/outbound-orders/api/server-functions/get-outbound-order-items.api"

export const outboundOrderItemsQueryOptions = (outboundOrderId: string) =>
  queryOptions({
    queryKey: ["outbound-orders", "detail", outboundOrderId, "items"],
    queryFn: () => getOutboundOrderItems({ data: { outboundOrderId } }),
  })

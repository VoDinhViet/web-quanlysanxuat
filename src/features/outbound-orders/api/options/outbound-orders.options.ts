import { queryOptions } from "@tanstack/react-query"

import { getOutboundOrders } from "@/features/outbound-orders/api/server-functions/get-outbound-orders.api"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

export const outboundOrdersQueryOptions = (
  search: OutboundOrdersSearchSchema
) =>
  queryOptions({
    queryKey: ["outbound-orders", "list", search],
    queryFn: () => getOutboundOrders({ data: search }),
  })

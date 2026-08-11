import { queryOptions } from "@tanstack/react-query"

import { getPurchaseOrders } from "@/features/purchase-orders/api/server-functions/get-purchase-orders.api"
import type { PurchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"

export const purchaseOrdersQueryOptions = (
  search: PurchaseOrdersSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-orders", "list", search],
    queryFn: () => getPurchaseOrders({ data: search }),
  })

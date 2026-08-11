import { queryOptions } from "@tanstack/react-query"

import { getPurchaseOrder } from "@/features/purchase-orders/api/server-functions/get-purchase-order.api"

export const purchaseOrderQueryOptions = (purchaseOrderId: string) =>
  queryOptions({
    queryKey: ["purchase-orders", "detail", purchaseOrderId],
    queryFn: () => getPurchaseOrder({ data: { purchaseOrderId } }),
  })

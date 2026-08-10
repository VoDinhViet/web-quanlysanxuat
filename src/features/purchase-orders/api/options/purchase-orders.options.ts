import { queryOptions } from "@tanstack/react-query"

import { queryPurchaseOrders } from "@/features/purchase-orders/mock/query-purchase-orders.mock"
import type { PurchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"

// Mock-backed for now (see resolve-purchase-order-progress.ts) — queryFn swaps to a real server
// function once GET /purchase-orders exists; nothing else in this factory changes.
export const purchaseOrdersQueryOptions = (
  search: PurchaseOrdersSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-orders", "list", search],
    queryFn: () => queryPurchaseOrders(search),
  })

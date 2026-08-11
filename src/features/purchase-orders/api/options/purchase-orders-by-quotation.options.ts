import { queryOptions } from "@tanstack/react-query"

import { getPurchaseOrdersByQuotation } from "@/features/purchase-orders/api/server-functions/get-purchase-orders-by-quotation.api"

export const purchaseOrdersByQuotationOptions = (quotationId: string) =>
  queryOptions({
    queryKey: ["purchase-orders", "by-quotation", quotationId],
    queryFn: () => getPurchaseOrdersByQuotation({ data: { quotationId } }),
  })

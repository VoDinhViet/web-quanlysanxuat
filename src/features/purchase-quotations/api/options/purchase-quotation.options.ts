import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotation.api"

export const purchaseQuotationQueryOptions = (purchaseQuotationId: string) =>
  queryOptions({
    queryKey: ["purchase-quotations", "detail", purchaseQuotationId],
    queryFn: () => getPurchaseQuotation({ data: { purchaseQuotationId } }),
  })

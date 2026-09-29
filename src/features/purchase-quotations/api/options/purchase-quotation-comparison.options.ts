import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotationComparison } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotation-comparison.api"

export const purchaseQuotationComparisonQueryOptions = (
  purchaseQuotationId: string
) =>
  queryOptions({
    queryKey: [
      "purchase-quotations",
      "detail",
      purchaseQuotationId,
      "comparison",
    ],
    queryFn: () =>
      getPurchaseQuotationComparison({ data: { purchaseQuotationId } }),
  })

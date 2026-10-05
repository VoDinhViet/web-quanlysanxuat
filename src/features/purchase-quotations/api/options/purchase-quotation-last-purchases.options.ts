import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotationLastPurchases } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotation-last-purchases.api"

export const purchaseQuotationLastPurchasesQueryOptions = (itemIds: string[]) =>
  queryOptions({
    queryKey: ["purchase-quotations", "last-purchases", itemIds],
    queryFn: () => getPurchaseQuotationLastPurchases({ data: { itemIds } }),
    enabled: itemIds.length > 0,
  })

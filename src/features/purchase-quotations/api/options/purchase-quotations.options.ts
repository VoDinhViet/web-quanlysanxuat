import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotations } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotations.api"
import type { PurchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"

export const purchaseQuotationsQueryOptions = (
  search: PurchaseQuotationsSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-quotations", "list", search],
    queryFn: () => getPurchaseQuotations({ data: search }),
  })

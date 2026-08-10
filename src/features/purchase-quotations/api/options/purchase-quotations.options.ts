import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotations } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotations.api"
import type { PurchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"

// `itemCount`/`creator` aren't on the wire as-is (see purchase-quotation.type.ts) — mapped here,
// right after fetching, so every other layer (columns, cells) just reads `row.itemCount`/
// `row.creator` like any other field.
export const purchaseQuotationsQueryOptions = (
  search: PurchaseQuotationsSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-quotations", "list", search],
    queryFn: async () => {
      const response = await getPurchaseQuotations({ data: search })

      return {
        ...response,
        data: response.data.map(({ items, creatorBy, ...rest }) => ({
          ...rest,
          itemCount: items.length,
          creator: creatorBy,
        })),
      }
    },
  })

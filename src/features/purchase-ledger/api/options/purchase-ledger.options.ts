import { queryOptions } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { getPurchaseLedger } from "@/features/purchase-ledger/api/server-functions/get-purchase-ledger.api"
import { resolvePurchaseLedgerWarnings } from "@/features/purchase-ledger/logic/resolve-purchase-ledger-warnings"
import type { PurchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"

// `warnings` isn't on the wire (see purchase-ledger.type.ts) — attached here, right after
// fetching, so every other layer (columns, cells, badges) just reads `row.warnings` like any
// other field.
export const purchaseLedgerQueryOptions = (
  search: PurchaseLedgerSearchSchema
) =>
  queryOptions({
    queryKey: ["purchase-ledger", "list", search],
    queryFn: async () => {
      const response = await getPurchaseLedger({ data: search })
      const today = DateTime.now()

      return {
        ...response,
        data: response.data.map((row) => ({
          ...row,
          warnings: resolvePurchaseLedgerWarnings(row, today),
        })),
      }
    },
  })

import { z } from "zod"

import { PurchaseOrderProgress } from "@/lib/types/purchase-order.type"

// Date filter params pass straight through as plain strings, same idiom as
// purchase-ledger-search.schema.ts — the value is always the ISO "yyyy-MM-dd" DateRangePicker
// already produces, so re-validating it here is redundant. Named `progress`/`fromDate`/`toDate`
// to match GetPurchaseOrdersReqDto 1:1 — no wire rename needed in the server function.
export const purchaseOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  progress: z.enum(PurchaseOrderProgress).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseOrdersSearchSchema = z.infer<
  typeof purchaseOrdersSearchSchema
>

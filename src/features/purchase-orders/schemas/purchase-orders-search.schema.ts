import { z } from "zod"

import { PurchaseOrderProgress } from "@/lib/types/purchase-order.type"

// Date filter params pass straight through as plain strings, same idiom as
// purchase-ledger-search.schema.ts — the value is always the ISO "yyyy-MM-dd" DateRangePicker
// already produces, so re-validating it here is redundant.
export const purchaseOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseOrderProgress).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  orderDateFrom: z.string().trim().min(1).optional().catch(undefined),
  orderDateTo: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseOrdersSearchSchema = z.infer<
  typeof purchaseOrdersSearchSchema
>

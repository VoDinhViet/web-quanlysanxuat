import { z } from "zod"

import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"

// Date filter params pass straight through as plain strings, same idiom as
// purchase-orders-search.schema.ts — the value is always the ISO "yyyy-MM-dd" DateRangePicker
// already produces, so re-validating it here is redundant. Named `fromDate`/`toDate` to match
// GetQuotationsReqDto 1:1 — no wire rename needed in the server function. No `supplierId` either —
// a single RFQ spans multiple suppliers by design (see purchase-quotation.type.ts), so the list
// has no supplier column to filter by.
export const purchaseQuotationsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseQuotationStatus).optional().catch(undefined),
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseQuotationsSearchSchema = z.infer<
  typeof purchaseQuotationsSearchSchema
>

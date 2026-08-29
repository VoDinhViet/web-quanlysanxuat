import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"

// Date filter params pass straight through as plain strings, same idiom as
// purchase-orders-search.schema.ts — the value is always the ISO "yyyy-MM-dd" DateRangePicker
// already produces, so re-validating it here is redundant. Named `startDate`/`endDate` to match
// GetQuotationsReqDto 1:1 — no wire rename needed in the server function. No `supplierId` either —
// a single RFQ spans multiple suppliers by design (see purchase-quotation.type.ts), so the list
// has no supplier column to filter by.
export const purchaseQuotationsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseQuotationStatus).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseQuotationsSearchSchema = z.infer<
  typeof purchaseQuotationsSearchSchema
>

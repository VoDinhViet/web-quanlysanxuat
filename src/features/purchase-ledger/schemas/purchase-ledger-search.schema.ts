import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"

// Date filter params pass straight through as plain strings (no luxon `.refine()` validation
// like orders/purchase-requests' own isoDateFilter) — the value is always the ISO "yyyy-MM-dd"
// DateRangePicker already produces, so re-validating it here is redundant.
export const purchaseLedgerSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseLedgerStatus).optional().catch(undefined),
  createdStartDate: z.string().trim().min(1).optional().catch(undefined),
  createdEndDate: z.string().trim().min(1).optional().catch(undefined),
  neededStartDate: z.string().trim().min(1).optional().catch(undefined),
  neededEndDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseLedgerSearchSchema = z.infer<
  typeof purchaseLedgerSearchSchema
>

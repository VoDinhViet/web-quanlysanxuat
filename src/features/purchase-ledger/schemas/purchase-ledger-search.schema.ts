import { z } from "zod"

import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"

// Date filter params pass straight through as plain strings (no luxon `.refine()` validation
// like orders/purchase-requests' own isoDateFilter) — the value is always the ISO "yyyy-MM-dd"
// DateRangePicker already produces, so re-validating it here is redundant.
export const purchaseLedgerSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseLedgerStatus).optional().catch(undefined),
  createdDateFrom: z.string().trim().min(1).optional().catch(undefined),
  createdDateTo: z.string().trim().min(1).optional().catch(undefined),
  neededDateFrom: z.string().trim().min(1).optional().catch(undefined),
  neededDateTo: z.string().trim().min(1).optional().catch(undefined),
})

export type PurchaseLedgerSearchSchema = z.infer<
  typeof purchaseLedgerSearchSchema
>

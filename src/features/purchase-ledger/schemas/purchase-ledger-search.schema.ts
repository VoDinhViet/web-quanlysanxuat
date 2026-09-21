import { z } from "zod"

import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"

// `z.iso.date()` validates the URL's "yyyy-MM-dd" strictly (a stray datetime or garbage string
// degrades to `undefined` via `.catch()`) but keeps the field a `string` — TanStack Router's
// search updater (`search: (prev) => ({...prev, x})`) requires the return value to match the
// schema's *input* type, so coercing to `Date` here would break every navigate handler on this
// route, not just the date ones. DateRangePicker works in `Date` (react-day-picker), so
// PurchaseLedgerTableFilter.tsx converts locally with `parseISO()`/`format()`.
export const purchaseLedgerSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseLedgerStatus).optional().catch(undefined),
  createdStartDate: z.iso.date().optional().catch(undefined),
  createdEndDate: z.iso.date().optional().catch(undefined),
  neededStartDate: z.iso.date().optional().catch(undefined),
  neededEndDate: z.iso.date().optional().catch(undefined),
  hasRemainingQuotation: z.boolean().optional().catch(undefined),
})

export type PurchaseLedgerSearchSchema = z.infer<
  typeof purchaseLedgerSearchSchema
>

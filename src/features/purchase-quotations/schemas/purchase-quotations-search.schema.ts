import { z } from "zod"

import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"

// `z.iso.date()` validates the URL's "yyyy-MM-dd" strictly (a stray datetime or garbage string
// degrades to `undefined` via `.catch()`) but keeps the field a `string` — TanStack Router's
// search updater (`search: (prev) => ({...prev, x})`) requires the return value to match the
// schema's *input* type, so coercing to `Date` here would break every navigate handler on this
// route, not just the date ones. DateRangePicker works in `Date` (react-day-picker), so
// PurchaseQuotationsTableFilter.tsx converts locally with `parseISO()`/`format()`. Named
// `startDate`/`endDate` to match GetQuotationsReqDto 1:1 — no wire rename needed in the server
// function. No `supplierId` either — a single RFQ spans multiple suppliers by design (see
// purchase-quotation.type.ts), so the list has no supplier column to filter by.
export const purchaseQuotationsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseQuotationStatus).optional().catch(undefined),
  startDate: z.iso.date().optional().catch(undefined),
  endDate: z.iso.date().optional().catch(undefined),
})

export type PurchaseQuotationsSearchSchema = z.infer<
  typeof purchaseQuotationsSearchSchema
>

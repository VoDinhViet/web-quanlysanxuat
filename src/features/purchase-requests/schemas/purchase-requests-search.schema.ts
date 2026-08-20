import { isValid, parseISO } from "date-fns"
import { z } from "zod"

import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

// Same shape as production-jobs-search.schema.ts's own isoDateFilter — a plain
// `^\d{4}-\d{2}-\d{2}$` regex would accept 2025-13-45, so validity is checked
// with date-fns. `.catch(undefined)` swallows a hand-mangled URL instead of
// letting validateSearch throw and take the route down.
const isoDateFilter = z
  .string()
  .refine((value) => isValid(parseISO(value)), {
    message: "Ngày không hợp lệ",
  })
  .optional()
  .catch(undefined)

export const purchaseRequestsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(PurchaseRequestStatus).optional().catch(undefined),
  departmentId: z.string().trim().min(1).optional().catch(undefined),
  createdDateFrom: isoDateFilter,
  createdDateTo: isoDateFilter,
})

export type PurchaseRequestsSearchSchema = z.infer<
  typeof purchaseRequestsSearchSchema
>

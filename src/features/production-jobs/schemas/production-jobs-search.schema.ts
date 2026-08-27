import { isValid, parseISO } from "date-fns"
import { z } from "zod"

import { ProductionJobStatus } from "@/lib/types/production-job.type"

// Same shape as production-orders-search.schema.ts's own isoDateFilter — a plain
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

// `itemId` isn't a filter on this screen's own filter bar — it's used programmatically by the
// finished-goods inventory detail screen's "LSX gần nhất" card
// (InventoryProductRecentActivityCards.tsx), via `productionJobsQueryOptions({itemId, limit: 10,
// ...})` (only the first row is used) through this feature's `api/index.ts` barrel. Backend
// prerequisite: GetProductionJobsReqDto doesn't accept `itemId` yet; proceeding on the assumption
// it lands alongside this frontend change, per the plan.
export const productionJobsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionJobStatus).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  itemId: z.uuid().optional().catch(undefined),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
})

export type ProductionJobsSearchSchema = z.infer<
  typeof productionJobsSearchSchema
>

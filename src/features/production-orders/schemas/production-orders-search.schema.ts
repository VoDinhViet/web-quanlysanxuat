import { DateTime } from "luxon"
import { z } from "zod"

import { ProductionOrderStatus } from "@/lib/types/production-order.type"

// Same shape as orders-search.schema.ts's own isoDateFilter — a plain
// `^\d{4}-\d{2}-\d{2}$` regex would accept 2025-13-45, so validity is checked
// with luxon. `.catch(undefined)` swallows a hand-mangled URL instead of
// letting validateSearch throw and take the route down.
const isoDateFilter = z
  .string()
  .refine((value) => DateTime.fromISO(value).isValid, {
    message: "Ngày không hợp lệ",
  })
  .optional()
  .catch(undefined)

// `status` always has a value (default "Chờ duyệt") rather than being optional like
// ordersSearchSchema's, because GET /api/production-orders needs exactly one
// ProductionOrderStatus and there is no "all" that would still mean "production queue".
export const productionOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionOrderStatus).catch(ProductionOrderStatus.PENDING),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
})

export type ProductionOrdersSearchSchema = z.infer<
  typeof productionOrdersSearchSchema
>

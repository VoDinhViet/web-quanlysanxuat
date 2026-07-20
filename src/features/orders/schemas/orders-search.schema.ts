import { DateTime } from "luxon"
import { z } from "zod"

import {
  OVERDUE_FILTER_VALUE,
  OrderStatus,
  PaymentTerm,
} from "@/features/orders/types/order.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"

// A plain `^\d{4}-\d{2}-\d{2}$` regex would accept 2025-13-45, so validity is
// checked with luxon. `.catch(undefined)` swallows a hand-mangled URL instead of
// letting validateSearch throw and take the route down.
const isoDateFilter = z
  .string()
  .refine((value) => DateTime.fromISO(value).isValid, {
    message: "Ngày không hợp lệ",
  })
  .optional()
  .catch(undefined)

// Mirrors the backend's GetOrdersReqDto (page/limit/q/order inherited from
// PageOptionsDto). `status` carries one extra value beyond OrderStatus:
// "OVERDUE" is a UI-only filter choice that get-orders.ts maps to a separate
// `overdue` query param.
//
// `orderDateFrom <= orderDateTo` is deliberately NOT enforced here — a
// schema-level .superRefine has no `.catch()` escape hatch, so a bad pair in the
// URL would crash the route. The filter UI clamps it and the backend rejects it.
export const ordersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z
    .union([z.enum(OrderStatus), z.literal(OVERDUE_FILTER_VALUE)])
    .optional()
    .catch(undefined),
  paymentTerm: z.enum(PaymentTerm).optional().catch(undefined),
  salesRepId: z.string().trim().min(1).optional().catch(undefined),
  orderDateFrom: isoDateFilter,
  orderDateTo: isoDateFilter,
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
})

export type OrdersSearchSchema = z.infer<typeof ordersSearchSchema>

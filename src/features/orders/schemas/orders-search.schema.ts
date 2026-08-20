import { isValid, parseISO } from "date-fns"
import { z } from "zod"

import { OrderStatus } from "@/lib/types/order.type"

const isoDateFilter = z
  .string()
  .refine((value) => isValid(parseISO(value)), {
    message: "Ngày không hợp lệ",
  })
  .optional()
  .catch(undefined)

// The backend's GetOrdersReqDto has no `paymentTerm` or `overdue` filter and no `salesRepId`
// (it's `assignedUserId`) — a URL carrying the old `status=OVERDUE`/`paymentTerm` params from
// before this schema changed just falls through each field's own `.catch(undefined)` instead
// of crashing.
export const ordersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(OrderStatus).optional().catch(undefined),
  assignedUserId: z.string().trim().min(1).optional().catch(undefined),
  orderDateFrom: isoDateFilter,
  orderDateTo: isoDateFilter,
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type OrdersSearchSchema = z.infer<typeof ordersSearchSchema>

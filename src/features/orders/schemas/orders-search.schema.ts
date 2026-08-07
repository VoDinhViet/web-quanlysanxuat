import { DateTime } from "luxon"
import { z } from "zod"

import {
  OVERDUE_FILTER_VALUE,
  OrderStatus,
  PaymentTerm,
} from "@/lib/types/order.type"

const isoDateFilter = z
  .string()
  .refine((value) => DateTime.fromISO(value).isValid, {
    message: "Ngày không hợp lệ",
  })
  .optional()
  .catch(undefined)

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
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type OrdersSearchSchema = z.infer<typeof ordersSearchSchema>

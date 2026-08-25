import { z } from "zod"

import {
  FulfillmentType,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"

// Mirrors the backend's GetOutboundOrdersReqDto (GET /api/outbound-orders).
export const outboundOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã DO
  clientId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(OutboundOrderStatus).optional().catch(undefined),
  fulfillmentType: z.enum(FulfillmentType).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OutboundOrdersSearchSchema = z.infer<
  typeof outboundOrdersSearchSchema
>

import { z } from "zod"

// Mirrors the backend's GetOutboundOrdersReqDto (GET /api/outbound-orders) — extends
// PageOptionsDto with no fields of its own, so `page`/`limit`/`q` (matches `outboundOrders.code`
// only) is genuinely everything the list endpoint accepts. No client/PO/status/delivery-method/
// product/date-range params exist server-side.
export const outboundOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã DO
})

export type OutboundOrdersSearchSchema = z.infer<
  typeof outboundOrdersSearchSchema
>

import type { z } from "zod"

import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

// The list's filters minus status, invoice status and paging: each stat tile counts the rows the
// list would show once filtered by that tile's own status.
export const outboundOrderStatsSearchSchema = outboundOrdersSearchSchema.pick({
  q: true,
  clientId: true,
  poNo: true,
  itemCode: true,
  itemName: true,
  fulfillmentType: true,
  startDate: true,
  endDate: true,
})

export type OutboundOrderStatsSearchSchema = z.infer<
  typeof outboundOrderStatsSearchSchema
>

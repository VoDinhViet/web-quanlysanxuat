import { z } from "zod"

import {
  FulfillmentType,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"

// Mirrors the backend's GetOutboundOrdersReqDto (GET /api/outbound-orders). `itemId` isn't a
// filter on this screen's own filter bar — it's used programmatically by the finished-goods
// inventory detail screen's "Giao hàng gần nhất" card (InventoryProductRecentActivityCards.tsx),
// via `outboundOrdersQueryOptions({itemId, limit: 10, ...})` (only the first row is used) through
// this feature's `api/index.ts` barrel. "Contains this item" means joining through
// `outbound_order_items.item_id`, not an `outbound_orders`-table column — backend prerequisite,
// not yet on GetOutboundOrdersReqDto; proceeding on the assumption it lands alongside this
// frontend change, per the plan.
export const outboundOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã DO
  clientId: z.string().trim().min(1).optional().catch(undefined),
  itemId: z.uuid().optional().catch(undefined),
  status: z.enum(OutboundOrderStatus).optional().catch(undefined),
  fulfillmentType: z.enum(FulfillmentType).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OutboundOrdersSearchSchema = z.infer<
  typeof outboundOrdersSearchSchema
>

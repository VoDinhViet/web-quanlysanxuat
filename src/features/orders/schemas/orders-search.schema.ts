import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { OrderStatus } from "@/lib/types/order.type"
import { isoDateFilter } from "@/lib/zod-transforms"

// The backend's GetOrdersReqDto has no `paymentTerm` or `overdue` filter and no `salesRepId`
// (it's `assignedUserId`) — a URL carrying the old `status=OVERDUE`/`paymentTerm` params from
// before this schema changed just falls through each field's own `.catch(undefined)` instead
// of crashing.
export const ordersSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(OrderStatus).optional().catch(undefined),
  assignedUserId: z.string().trim().min(1).optional().catch(undefined),
  // Used programmatically by the finished-goods inventory detail screen's "PO liên quan" card
  // (InventoryProductRecentActivityCards.tsx), via `ordersQueryOptions({itemId, limit: 10, ...})`
  // (only the first row is used) through this feature's `api/index.ts` barrel — not a filter on
  // this screen's own filter bar. The item lives on an order *line*, so this means joining
  // through `order_items.item_id`, not an `orders`-table column — backend prerequisite, not yet
  // on GetOrdersReqDto; proceeding on the assumption it lands alongside this frontend change,
  // per the plan.
  itemId: z.uuid().optional().catch(undefined),
  orderDateFrom: isoDateFilter,
  orderDateTo: isoDateFilter,
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type OrdersSearchSchema = z.infer<typeof ordersSearchSchema>

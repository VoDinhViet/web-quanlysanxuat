import { z } from "zod"

// Only tabs with a real data source get a URL value — "Tiến độ thực hiện",
// "Lịch sử giao hàng" and "Lịch sử thanh toán" render as locked tab triggers
// (see OrderDetailTabs) until the backend has DO/payment tracking to back them.
export const ORDER_DETAIL_TABS = ["info", "items", "notes"] as const

export type OrderDetailTab = (typeof ORDER_DETAIL_TABS)[number]

// The active tab is shareable state, so it lives in the URL rather than
// useState (see .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled
// `?tab=` from crashing the route.
export const orderDetailSearchSchema = z.object({
  tab: z.enum(ORDER_DETAIL_TABS).catch("info"),
})

export type OrderDetailSearchSchema = z.infer<typeof orderDetailSearchSchema>

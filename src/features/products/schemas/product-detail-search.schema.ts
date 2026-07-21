import { z } from "zod"

// Tab order matches the numbered labels in the UI ("1. Thông tin sản phẩm", …).
export const PRODUCT_DETAIL_TABS = [
  "info",
  "structure",
  "materials",
  "revisions",
] as const

export type ProductDetailTab = (typeof PRODUCT_DETAIL_TABS)[number]

// The active tab is shareable state, so it lives in the URL rather than
// useState (see .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled
// `?tab=` from crashing the route.
//
// The BOM tab's `page`/`limit` params are deliberately NOT declared yet — that
// tab is a placeholder until its backend lands, and carrying dead pagination in
// every link to this route would be noise. They use those exact names when
// added so the shared TablePagination drops in unchanged.
export const productDetailSearchSchema = z.object({
  tab: z.enum(PRODUCT_DETAIL_TABS).catch("info"),
})

export type ProductDetailSearchSchema = z.infer<
  typeof productDetailSearchSchema
>

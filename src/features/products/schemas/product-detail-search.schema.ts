import { z } from "zod"

export type ProductDetailTab = "info" | "boms" | "materials"

// Tab order matches the numbered labels in the UI ("1. Thông tin sản phẩm", …).
// Exported for ProductDetailPage's onValueChange guard: Radix widens the value
// to `string`, and safeParse narrows it back without a cast.
export const productDetailTabSchema = z.enum(["info", "boms", "materials"])

// The active tab is shareable state, so it lives in the URL rather than
// useState (see .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled
// `?tab=` from crashing the route.
//
// `page`/`limit`/`q` back the "materials" tab's list (GET .../bom/materials) —
// the only tab with pagination. They stay `.optional()` (no concrete default)
// so the other two tabs' links don't carry dead pagination noise; the
// materials tab defaults them itself when reading `useSearch()`.
export const productDetailSearchSchema = z.object({
  tab: productDetailTabSchema.catch("info"),
  page: z.number().int().min(1).optional().catch(undefined),
  limit: z
    .union([z.literal(10), z.literal(20), z.literal(50)])
    .optional()
    .catch(undefined),
  q: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductDetailSearchSchema = z.infer<
  typeof productDetailSearchSchema
>

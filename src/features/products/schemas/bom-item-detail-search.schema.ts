import { z } from "zod"

export type BomItemDetailTab = "info" | "consumables" | "operations"

// Exported for BomItemDetailPage's onValueChange guard: Radix widens the value
// to `string`, and safeParse narrows it back without a cast.
export const bomItemDetailTabSchema = z.enum([
  "info",
  "consumables",
  "operations",
])

// The active tab is shareable state, so it lives in the URL rather than
// useState (see .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled
// `?tab=` from crashing the route. No pagination here — the Vật tư/Công đoạn
// tabs render the node's own embedded lists, not a paged endpoint.
export const bomItemDetailSearchSchema = z.object({
  tab: bomItemDetailTabSchema.catch("info"),
})

export type BomItemDetailSearchSchema = z.infer<
  typeof bomItemDetailSearchSchema
>

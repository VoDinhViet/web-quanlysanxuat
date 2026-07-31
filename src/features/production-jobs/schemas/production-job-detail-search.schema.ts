import { z } from "zod"

// 3 tab, không phải 6 như mockup gốc — "Tài liệu"/"Ghi chú"/"Lịch sử" gộp thành các khối phụ bên
// trong tab "info" (xem ProductionJobInfoTab.tsx) để thanh tab không tràn ngang.
export const PRODUCTION_JOB_DETAIL_TABS = ["info", "bom", "operations"] as const

export type ProductionJobDetailTab = (typeof PRODUCTION_JOB_DETAIL_TABS)[number]

// The active tab is shareable state, so it lives in the URL rather than useState (see
// .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled `?tab=` from crashing the route.
export const productionJobDetailSearchSchema = z.object({
  tab: z.enum(PRODUCTION_JOB_DETAIL_TABS).catch("info"),
})

export type ProductionJobDetailSearchSchema = z.infer<
  typeof productionJobDetailSearchSchema
>

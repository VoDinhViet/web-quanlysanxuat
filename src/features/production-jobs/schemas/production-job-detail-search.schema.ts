import { z } from "zod"

// 3 tab, không phải 6 như mockup gốc — "Tài liệu"/"Ghi chú"/"Lịch sử" gộp thành các khối phụ bên
// trong tab "info" (xem ProductionJobInfoTab.tsx) để thanh tab không tràn ngang. Value khớp tên
// endpoint mỗi tab đọc: "materials" ↔ GET .../materials, "bom" ↔ GET .../bom.
export const productionJobDetailTabs = ["info", "materials", "bom"] as const

export type ProductionJobDetailTab = (typeof productionJobDetailTabs)[number]

// The active tab is shareable state, so it lives in the URL rather than useState (see
// .claude/rules/forms-and-ui.md). `.catch` keeps a hand-mangled `?tab=` from crashing the route.
//
// `page`/`limit`/`q` back the "materials" tab's list (GET .../materials) — the only tab with
// pagination, same idiom as product-detail-search.schema.ts. They stay `.optional()` so the
// other two tabs' links don't carry dead pagination noise; the materials tab defaults them itself.
export const productionJobDetailSearchSchema = z.object({
  tab: z.enum(productionJobDetailTabs).catch("info"),
  page: z.number().int().min(1).optional().catch(undefined),
  limit: z
    .union([z.literal(10), z.literal(20), z.literal(50)])
    .optional()
    .catch(undefined),
  q: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductionJobDetailSearchSchema = z.infer<
  typeof productionJobDetailSearchSchema
>

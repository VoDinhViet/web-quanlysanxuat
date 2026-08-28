import { z } from "zod"

// "Sửa" (BUG-090) không có route riêng — edit-inline ngay trên trang Chi tiết, `mode` là state chia
// sẻ được nên sống ở URL thay vì useState (`.claude/rules/forms-and-ui.md`). `.catch` đưa mọi giá
// trị lạ (link cũ, tay gõ `?mode=xyz`) về "view" thay vì crash route — cùng idiom
// production-job-detail-search.schema.ts's `tab`.
export const outboundOrderDetailModes = ["view", "edit"] as const

export type OutboundOrderDetailMode = (typeof outboundOrderDetailModes)[number]

export const outboundOrderDetailSearchSchema = z.object({
  mode: z.enum(outboundOrderDetailModes).catch("view"),
})

export type OutboundOrderDetailSearchSchema = z.infer<
  typeof outboundOrderDetailSearchSchema
>

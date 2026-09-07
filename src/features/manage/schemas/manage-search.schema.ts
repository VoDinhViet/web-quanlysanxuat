import { z } from "zod"

// Chỉ 1 filter cho toàn trang /manage hiện tại: khoảng ngày của widget "Tiến độ sản xuất"
// (ManageProductionChart.tsx). Search param thay vì useState vì đây là filter — theo convention
// chung của app (shareable qua URL).
export const manageSearchSchema = z.object({
  startDate: z.iso.date().optional().catch(undefined),
  endDate: z.iso.date().optional().catch(undefined),
})

export type ManageSearchSchema = z.infer<typeof manageSearchSchema>

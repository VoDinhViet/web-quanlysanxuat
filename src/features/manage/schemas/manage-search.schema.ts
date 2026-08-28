import { z } from "zod"

// Chỉ 1 filter cho toàn trang /manage hiện tại: khoảng ngày của widget "Tiến độ sản xuất"
// (ManageProductionChart.tsx). Search param thay vì useState vì đây là filter — theo convention
// chung của app (shareable qua URL).
export const manageSearchSchema = z.object({
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type ManageSearchSchema = z.infer<typeof manageSearchSchema>

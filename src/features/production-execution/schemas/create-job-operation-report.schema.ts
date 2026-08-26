import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Tên field/khớp đúng CreateJobOperationReportReqDto (be-quanlysanxuat) —
// `jobOperationId` là id của `production_job_operations` (route param
// POST /production-execution/operations/:jobOperationId/reports), không phải id công đoạn danh
// mục (`operations.id`, field `ProductionJobOperation.operationId` — khác nhau, đặt tên
// `operationId` ở đây từng dễ gây nhầm 2 id này với nhau).
//
// `completedQuantityDelta` là SL cộng thêm lần này (không phải giá trị tuyệt đối) — BE tự cộng
// dồn, khoá row. Ràng buộc `delta + completedQuantity hiện có + rejectedQuantity <= plannedQuantity`
// phụ thuộc dữ liệu runtime của operation đang chọn nên không nằm trong schema tĩnh này — nơi dùng
// (JobOperationReportForm.tsx) tự `.refine()` thêm, cùng idiom
// ProductionJobOperationCompletedQuantityCell.tsx's `CompletedQuantityInput`; BE (`E252`) vẫn là
// chốt chặn thật.
export const createJobOperationReportSchema = z.object({
  jobOperationId: z.uuid(),
  completedQuantityDelta: z
    .number("SL hoàn thành phải là số")
    .min(0, "SL hoàn thành không được nhỏ hơn 0."),
  rejectedQuantityDelta: z
    .number("SL không đạt phải là số")
    .min(0, "SL không đạt không được nhỏ hơn 0."),
  completedDate: z.string().min(1, "Vui lòng chọn ngày hoàn thành."),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự.")
    .transform(emptyToUndefined),
  images: z.array(fileFieldSchema),
})

export type CreateJobOperationReportSchema = z.infer<
  typeof createJobOperationReportSchema
>

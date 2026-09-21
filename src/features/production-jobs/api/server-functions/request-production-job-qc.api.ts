import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRequestProductionJobQcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "oqc_inspection.error.job_not_in_progress":
      return "Job không còn đang sản xuất (IN_PROGRESS)."
    case "production_job.error.no_final_assembly":
      return "Job không có công đoạn lắp ráp Cấp 0 — không thể yêu cầu QC qua đây."
    case "production_job.error.operations_not_completed":
      return "Còn công đoạn chưa hoàn thành — cần xong toàn bộ trước khi yêu cầu QC."
    case "oqc_inspection.error.item_not_resolvable":
      return "Không xác định được vật tư cần QC — dữ liệu BOM của Job đã mất liên kết."
    case "oqc_inspection.error.lot_size_exceeded":
      return "Tổng SL đã xin QC vượt định mức kế hoạch của Job."
    case "oqc_inspection.error.operation_completed_quantity_insufficient":
      return "Job này đã được yêu cầu QC trước đó."
    case "auth.error.forbidden":
      return "Bạn không có quyền yêu cầu QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Yêu cầu QC thành phẩm cho cả Job — 1 cú bấm, server tự resolve công đoạn Cấp 0 (xem
// production-job.type.ts). Không có đường hoàn tác — trùng lặp gọi lại sẽ bị BE chặn
// (oqc_inspection.error.operation_completed_quantity_insufficient).
export const requestProductionJobQc = createServerFn({ method: "POST" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/production-jobs/${data.productionJobId}/qc`)
    } catch (error) {
      logHttpError(error, "requestProductionJobQc")

      throw new Error(resolveRequestProductionJobQcErrorMessage(error))
    }
  })

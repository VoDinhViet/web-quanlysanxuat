import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { toIsoDate } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateJobOperationDueDateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Chỉ đặt được hạn khi Job đang sản xuất."
    case "production_job_operation.error.not_found":
      return "Không tìm thấy công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateJobOperationDueDateParamsSchema = z.object({
  productionJobId: z.uuid(),
  jobOperationId: z.uuid(),
  dueDate: z.string().min(1).transform(toIsoDate),
})

// Đặt/sửa hạn cần hoàn thành của một công đoạn — PATCH
// /production-jobs/:productionJobId/operations/:jobOperationId/due-date. Ghi đè thẳng (không cộng
// dồn như báo cáo tiến độ), cho phép cả công đoạn OUTSOURCE (khác createJobOperationReport chặn
// E260) — hạn là kế hoạch điều độ, không phải số liệu OS-IN tự ghi.
export const updateJobOperationDueDate = createServerFn({ method: "POST" })
  .validator(updateJobOperationDueDateParamsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productionJobId, jobOperationId, dueDate } = data
      await http.patch(
        `/api/production-jobs/${productionJobId}/operations/${jobOperationId}/due-date`,
        { dueDate }
      )
    } catch (error) {
      logHttpError(error, "updateJobOperationDueDate")

      throw new Error(resolveUpdateJobOperationDueDateErrorMessage(error))
    }
  })

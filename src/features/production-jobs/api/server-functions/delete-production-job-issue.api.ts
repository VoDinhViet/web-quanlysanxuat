import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteProductionJobIssueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Job đã xác nhận kế hoạch, không thể xoá vật tư. Vui lòng tải lại trang."
    case "production_job_issue.error.not_found":
      return "Không tìm thấy dòng vật tư. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa vật tư của Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Xoá một vật tư khỏi Job — chỉ Job PENDING.
export const deleteProductionJobIssue = createServerFn({ method: "POST" })
  .validator(z.object({ productionJobId: z.uuid(), issueId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(
        `/api/production-jobs/${data.productionJobId}/bom/${data.issueId}`
      )
    } catch (error) {
      logHttpError(error, "deleteProductionJobIssue")

      throw new Error(resolveDeleteProductionJobIssueErrorMessage(error))
    }
  })

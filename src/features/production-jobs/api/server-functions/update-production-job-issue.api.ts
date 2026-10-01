import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateProductionJobIssueSchema } from "@/features/production-jobs/schemas/update-production-job-issue.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductionJobIssueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Job đã xác nhận kế hoạch, không thể sửa vật tư. Vui lòng tải lại trang."
    case "production_job_issue.error.not_found":
      return "Không tìm thấy dòng vật tư. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa vật tư của Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Sửa số lượng một vật tư của Job — chỉ Job PENDING.
export const updateProductionJobIssue = createServerFn({ method: "POST" })
  .validator(updateProductionJobIssueSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productionJobId, issueId, requiredQty } = data
      await http.patch(
        `/api/production-jobs/${productionJobId}/bom/${issueId}`,
        { requiredQty }
      )
    } catch (error) {
      logHttpError(error, "updateProductionJobIssue")

      throw new Error(resolveUpdateProductionJobIssueErrorMessage(error))
    }
  })

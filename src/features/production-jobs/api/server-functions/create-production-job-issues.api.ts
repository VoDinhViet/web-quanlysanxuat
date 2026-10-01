import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createProductionJobIssuesSchema } from "@/features/production-jobs/schemas/create-production-job-issues.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductionJobIssuesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Job đã xác nhận kế hoạch, không thể thêm vật tư. Vui lòng tải lại trang."
    case "production_job_issue.error.duplicate_item":
      return "Có vật tư đã nằm trong Job. Hãy sửa số lượng ở dòng hiện có."
    case "production_job_issue.error.item_not_direct":
      return "Chỉ thêm được vật tư (không phải thành phẩm) vào Job."
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa vật tư của Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Thêm một hoặc nhiều vật tư riêng cho Job — chỉ Job PENDING, không đụng sản phẩm gốc.
export const createProductionJobIssues = createServerFn({ method: "POST" })
  .validator(createProductionJobIssuesSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productionJobId, items } = data
      await http.post(`/api/production-jobs/${productionJobId}/bom`, {
        items,
      })
    } catch (error) {
      logHttpError(error, "createProductionJobIssues")

      throw new Error(resolveCreateProductionJobIssuesErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveProductionJobOperationsErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Chỉ có thể duyệt công đoạn khi Job đang sản xuất."
    case "production_job.error.operations_already_approved":
      return "Job đã được duyệt công đoạn trước đó. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Duyệt công đoạn của cả Job một lần — không đổi status, chỉ mở khoá PATCH .../operations/:operationId
// (E250 tới khi có). Một chiều, không có route huỷ duyệt (production-job.type.ts).
export const approveProductionJobOperations = createServerFn({
  method: "POST",
})
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/production-jobs/${data.productionJobId}/approve-operations`
      )
    } catch (error) {
      logHttpError(error, "approveProductionJobOperations")

      throw new Error(resolveApproveProductionJobOperationsErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveStartProductionJobErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Job không còn ở trạng thái chờ sản xuất. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING → IN_PROGRESS, một chiều — không có route lùi (xem production-job.type.ts).
export const startProductionJob = createServerFn({ method: "POST" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/production-jobs/${data.productionJobId}/start`)
    } catch (error) {
      logHttpError(error, "startProductionJob")

      throw new Error(resolveStartProductionJobErrorMessage(error))
    }
  })

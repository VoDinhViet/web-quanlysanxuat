import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobOperation } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductionJobOperationErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Chỉ có thể cập nhật khi Job đang sản xuất."
    case "production_job_operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "production_job_operation.error.completed_plus_rejected_exceeds_planned":
      return "Tổng SL hoàn thành + SL không đạt không được vượt SL kế hoạch."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateProductionJobOperationSchema = z.object({
  productionJobId: z.uuid(),
  operationId: z.uuid(),
  completedQuantity: z.number().min(0),
  rejectedQuantity: z.number().min(0),
})

export const updateProductionJobOperation = createServerFn({ method: "POST" })
  .validator(updateProductionJobOperationSchema)
  .handler(async ({ data }): Promise<ProductionJobOperation> => {
    try {
      const {
        productionJobId,
        operationId,
        completedQuantity,
        rejectedQuantity,
      } = data
      const response = await http.patch<ProductionJobOperation>(
        `/api/production-jobs/${productionJobId}/operations/${operationId}`,
        { completedQuantity, rejectedQuantity }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductionJobOperation")

      throw new Error(resolveUpdateProductionJobOperationErrorMessage(error))
    }
  })

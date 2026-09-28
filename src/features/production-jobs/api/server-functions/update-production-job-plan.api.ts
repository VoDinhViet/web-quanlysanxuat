import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { toIsoDate } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductionJobPlanErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Chỉ lập kế hoạch được khi Job đang sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateProductionJobPlanParamsSchema = z.object({
  productionJobId: z.uuid(),
  operations: z.array(
    z.object({
      id: z.uuid(),
      dueDate: z.string().min(1).transform(toIsoDate),
    })
  ),
})

// Cập nhật hàng loạt hạn cần hoàn thành của các công đoạn theo kế hoạch sản xuất:
// PATCH /api/production-jobs/:productionJobId/operations/plan
export const updateProductionJobPlan = createServerFn({ method: "POST" })
  .validator(updateProductionJobPlanParamsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productionJobId, operations } = data
      await http.patch(
        `/api/production-jobs/${productionJobId}/operations/plan`,
        { operations }
      )
    } catch (error) {
      logHttpError(error, "updateProductionJobPlan")

      throw new Error(resolveUpdateProductionJobPlanErrorMessage(error))
    }
  })

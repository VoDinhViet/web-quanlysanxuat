import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobPlanBomItem } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobPlanOperationsErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Cùng GET /production-jobs/:jobId/operations với getProductionJobOperations, nhưng chỉ gọi khi Job
// PENDING — BE trả kế hoạch tạm tính (chưa lưu, không có id công đoạn), khác shape nên tách hàm.
export const getProductionJobPlanOperations = createServerFn({ method: "GET" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionJobPlanBomItem[]> => {
    try {
      const response = await http.get<ProductionJobPlanBomItem[]>(
        `/api/production-jobs/${data.productionJobId}/operations`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobPlanOperations")

      throw new Error(resolveGetProductionJobPlanOperationsErrorMessage(error))
    }
  })

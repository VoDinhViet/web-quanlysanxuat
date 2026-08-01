import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobStep } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobStepsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem công đoạn của Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionJobSteps = createServerFn({ method: "GET" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionJobStep[]> => {
    try {
      const response = await http.get<ProductionJobStep[]>(
        `/api/production-jobs/${data.productionJobId}/steps`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobSteps")

      throw new Error(resolveGetProductionJobStepsErrorMessage(error))
    }
  })

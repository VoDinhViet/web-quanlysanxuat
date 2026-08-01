import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionJob = createServerFn({ method: "GET" })
  .validator(z.object({ jobId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionJobDetail> => {
    try {
      const response = await http.get<ProductionJobDetail>(
        `/api/production-jobs/${data.jobId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJob")

      throw new Error(resolveGetProductionJobErrorMessage(error))
    }
  })

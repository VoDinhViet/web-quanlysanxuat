import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobLog } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobLogsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lịch sử của Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// No filters beyond pagination — GetProductionJobLogsReqDto is bare PageOptionsDto.
export const getProductionJobLogs = createServerFn({ method: "GET" })
  .validator(
    z.object({
      productionJobId: z.uuid(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
    })
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionJobLog>> => {
    try {
      const { productionJobId, page, limit } = data
      const response = await http.get<PaginatedResponse<ProductionJobLog>>(
        `/api/production-jobs/${productionJobId}/logs`,
        { params: { page, limit } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobLogs")

      throw new Error(resolveGetProductionJobLogsErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionExecutionReport } from "@/lib/types/production-job.type"

const getJobOperationReportsParamsSchema = z.object({
  productionJobId: z.string().uuid(),
  operationId: z.string().uuid().optional(),
  jobOperationId: z.string().uuid().optional(),
})

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra khi tải lịch sử báo cáo."

function resolveGetJobOperationReportsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lịch sử báo cáo."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getJobOperationReports = createServerFn({ method: "GET" })
  .validator(getJobOperationReportsParamsSchema)
  .handler(async ({ data }): Promise<ProductionExecutionReport[]> => {
    try {
      const { productionJobId, ...params } = data
      const response = await http.get<ProductionExecutionReport[]>(
        `/api/production-execution/jobs/${productionJobId}/reports`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getJobOperationReports")

      throw new Error(resolveGetJobOperationReportsErrorMessage(error))
    }
  })

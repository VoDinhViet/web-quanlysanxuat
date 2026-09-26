import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobBomItem } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionExecutionJobOperationsErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_execution.error.operation_not_assigned":
      return "Bạn chưa được phân công vào công đoạn này."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem màn Thực hiện sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Part → công đoạn của Job đã lọc theo `operationId` (`GET /production-execution/jobs/:id/operations`).
export const getProductionExecutionJobOperations = createServerFn({
  method: "GET",
})
  .validator(z.object({ productionJobId: z.uuid(), operationId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionJobBomItem[]> => {
    try {
      const response = await http.get<ProductionJobBomItem[]>(
        `/api/production-execution/jobs/${data.productionJobId}/operations`,
        { params: { operationId: data.operationId } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionExecutionJobOperations")

      throw new Error(
        resolveGetProductionExecutionJobOperationsErrorMessage(error)
      )
    }
  })

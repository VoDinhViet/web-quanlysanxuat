import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionExecutionJobDetail } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionExecutionJobErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_execution.error.operation_not_assigned":
      return "Bạn chưa được phân công vào công đoạn này."
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem màn Thực hiện sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Header của Job cho màn "Thực hiện sản xuất" — BE kiểm công đoạn `operationId` có nằm trong phạm
// vi được phân công không (`GET /production-execution/jobs/:id`, cần `production-execution:read`).
export const getProductionExecutionJob = createServerFn({ method: "GET" })
  .validator(z.object({ productionJobId: z.uuid(), operationId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionExecutionJobDetail> => {
    try {
      const response = await http.get<ProductionExecutionJobDetail>(
        `/api/production-execution/jobs/${data.productionJobId}`,
        { params: { operationId: data.operationId } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionExecutionJob")

      throw new Error(resolveGetProductionExecutionJobErrorMessage(error))
    }
  })

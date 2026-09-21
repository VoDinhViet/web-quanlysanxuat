import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { productionExecutionSearchSchema } from "@/features/production-execution/schemas/production-execution-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobByOperation } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `operationId` bắt buộc ở đây (khác schema search chung, nơi nó tuỳ chọn cho tới khi trang chọn
// xong thẻ đầu tiên) — page chỉ gọi query này khi đã có operationId (`enabled: Boolean(...)`, xem
// ProductionExecutionPage.tsx). `dueDateFrom`/`dueDateTo` rename `startDate`/`endDate` trên wire,
// giống get-production-jobs.api.ts.
const getProductionJobsByOperationParamsSchema = productionExecutionSearchSchema
  .extend({ operationId: z.string().trim().min(1) })
  .transform(({ dueDateFrom, dueDateTo, ...rest }) => ({
    ...rest,
    startDate: dueDateFrom,
    endDate: dueDateTo,
  }))

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobsByOperationErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách công việc."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// "DANH SÁCH CÔNG VIỆC" — GET /production-execution/jobs. Một dòng / (Job × công đoạn đang
// chọn), số lượng gộp qua mọi part của Job có công đoạn đó.
export const getProductionJobsByOperation = createServerFn({ method: "GET" })
  .validator(getProductionJobsByOperationParamsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<ProductionJobByOperation>> => {
      try {
        const response = await http.get<
          PaginatedResponse<ProductionJobByOperation>
        >("/api/production-execution/jobs", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getProductionJobsByOperation")

        throw new Error(resolveGetProductionJobsByOperationErrorMessage(error))
      }
    }
  )

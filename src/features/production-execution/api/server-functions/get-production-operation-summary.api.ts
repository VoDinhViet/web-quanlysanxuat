import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productionExecutionSearchSchema } from "@/features/production-execution/schemas/production-execution-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOperationSummary } from "@/lib/types/production-job.type"

// Same filter set as get-production-jobs-by-operation.api.ts minus pagination/operationId —
// "CHỌN CÔNG ĐOẠN" tile row needs the count per operation across the same filtered set the job
// table below it reads. `dueDateFrom`/`dueDateTo` rename to `startDate`/`endDate` on the wire,
// same as get-production-jobs.api.ts.
const getProductionOperationSummaryParamsSchema =
  productionExecutionSearchSchema
    .pick({
      q: true,
      status: true,
      clientId: true,
      dueDateFrom: true,
      dueDateTo: true,
    })
    .transform(({ dueDateFrom, dueDateTo, ...rest }) => ({
      ...rest,
      startDate: dueDateFrom,
      endDate: dueDateTo,
    }))

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionOperationSummaryErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// "CHỌN CÔNG ĐOẠN" tile row — GET /production-execution/operations. Mảng thường, không phân
// trang: một phần tử / công đoạn thật (`operations`, không gộp theo `type`) có ít nhất 1 Job khớp
// filter.
export const getProductionOperationSummary = createServerFn({ method: "GET" })
  .validator(getProductionOperationSummaryParamsSchema)
  .handler(async ({ data }): Promise<ProductionOperationSummary[]> => {
    try {
      const response = await http.get<ProductionOperationSummary[]>(
        "/api/production-execution/operations",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionOperationSummary")

      throw new Error(resolveGetProductionOperationSummaryErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJob } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `dueDateFrom`/`dueDateTo` rename to `fromDate`/`toDate` here — GetProductionJobsReqDto's field
// names (the URL param names stay as-is so existing links keep working; only the wire shape
// changes).
const getProductionJobsParamsSchema = productionJobsSearchSchema.transform(
  ({ dueDateFrom, dueDateTo, ...rest }) => ({
    ...rest,
    fromDate: dueDateFrom,
    toDate: dueDateTo,
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionJobs = createServerFn({ method: "GET" })
  .validator(getProductionJobsParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionJob>> => {
    try {
      const response = await http.get<PaginatedResponse<ProductionJob>>(
        "/api/production-jobs",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobs")

      throw new Error(resolveGetProductionJobsErrorMessage(error))
    }
  })

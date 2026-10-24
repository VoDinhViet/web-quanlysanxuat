import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productionJobStatsSearchSchema } from "@/features/production-jobs/schemas/production-job-stats-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobStats } from "@/lib/types/production-job.type"

// Same rename as getProductionJobs: GetProductionJobStatsReqDto takes `startDate`/`endDate`.
const getProductionJobStatsParamsSchema =
  productionJobStatsSearchSchema.transform(
    ({ dueDateFrom, dueDateTo, ...rest }) => ({
      ...rest,
      startDate: dueDateFrom,
      endDate: dueDateTo,
    })
  )

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem thống kê Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionJobStats = createServerFn({ method: "GET" })
  .validator(getProductionJobStatsParamsSchema)
  .handler(async ({ data }): Promise<ProductionJobStats> => {
    try {
      const response = await http.get<ProductionJobStats>(
        "/api/production-jobs/stats",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobStats")

      throw new Error(resolveGetProductionJobStatsErrorMessage(error))
    }
  })

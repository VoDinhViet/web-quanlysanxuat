import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobBomErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getProductionJobBomSchema = z.object({
  productionJobId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
})

// Tab "BOM"'s source — GET /production-jobs/:jobId/bom returns the Job's material demand
// (paginated), NOT the BOM tree despite the route's name. See ProductionJobIssue's doc comment.
export const getProductionJobBom = createServerFn({ method: "GET" })
  .validator(getProductionJobBomSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionJobIssue>> => {
    try {
      const { productionJobId, ...params } = data
      const response = await http.get<PaginatedResponse<ProductionJobIssue>>(
        `/api/production-jobs/${productionJobId}/bom`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobBom")

      throw new Error(resolveGetProductionJobBomErrorMessage(error))
    }
  })

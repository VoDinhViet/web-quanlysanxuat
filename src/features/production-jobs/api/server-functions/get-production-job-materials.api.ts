import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductionJobMaterial } from "@/lib/types/production-job.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobMaterialsErrorMessage(error: unknown): string {
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

const getProductionJobMaterialsSchema = z.object({
  productionJobId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
})

export const getProductionJobMaterials = createServerFn({ method: "GET" })
  .validator(getProductionJobMaterialsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<ProductionJobMaterial>> => {
      try {
        const { productionJobId, ...params } = data
        const response = await http.get<
          PaginatedResponse<ProductionJobMaterial>
        >(`/api/production-jobs/${productionJobId}/materials`, { params })

        return response.data
      } catch (error) {
        logHttpError(error, "getProductionJobMaterials")

        throw new Error(resolveGetProductionJobMaterialsErrorMessage(error))
      }
    }
  )

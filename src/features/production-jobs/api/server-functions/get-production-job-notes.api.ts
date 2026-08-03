import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobNote } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobNotesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem ghi chú của Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// The backend's GetProductionJobNotesReqDto accepts `q` but the service never filters on it —
// only page/limit are sent here.
export const getProductionJobNotes = createServerFn({ method: "GET" })
  .validator(
    z.object({
      productionJobId: z.uuid(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
    })
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionJobNote>> => {
    try {
      const { productionJobId, page, limit } = data
      const response = await http.get<PaginatedResponse<ProductionJobNote>>(
        `/api/production-jobs/${productionJobId}/notes`,
        { params: { page, limit } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobNotes")

      throw new Error(resolveGetProductionJobNotesErrorMessage(error))
    }
  })

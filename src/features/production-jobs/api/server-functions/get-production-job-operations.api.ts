import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionJobBomItem } from "@/lib/types/production-job.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobOperationsErrorMessage(error: unknown): string {
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

// "Công đoạn sản xuất" tab's source — GET /production-jobs/:jobId/operations returns every BOM
// item with at least one as-used operation, plain array (not paginated), server-grouped — each
// BOM item carries its own `operations[]`. See ProductionJobBomItem's doc comment.
export const getProductionJobOperations = createServerFn({ method: "GET" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionJobBomItem[]> => {
    try {
      const response = await http.get<ProductionJobBomItem[]>(
        `/api/production-jobs/${data.productionJobId}/operations`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobOperations")

      throw new Error(resolveGetProductionJobOperationsErrorMessage(error))
    }
  })

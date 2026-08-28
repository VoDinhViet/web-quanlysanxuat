import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionProgress } from "@/lib/types/report.type"

const getProductionProgressParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionProgressErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem tiến độ sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionProgress = createServerFn({ method: "GET" })
  .validator(getProductionProgressParamsSchema)
  .handler(async ({ data }): Promise<ProductionProgress> => {
    try {
      const response = await http.get<ProductionProgress>(
        "/api/reports/production-progress",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionProgress")

      throw new Error(resolveGetProductionProgressErrorMessage(error))
    }
  })

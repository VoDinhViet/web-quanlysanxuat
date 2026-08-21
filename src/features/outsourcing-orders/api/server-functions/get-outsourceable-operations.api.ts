import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourceableOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách chi tiết cần gia công."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getOutsourceableOperationsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  productionJobId: optional(z.string().trim()),
  operationId: optional(z.string().trim()),
})

export const getOutsourceableOperations = createServerFn({ method: "GET" })
  .validator(getOutsourceableOperationsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<OutsourceableOperation>> => {
      try {
        const response = await http.get<
          PaginatedResponse<OutsourceableOperation>
        >("/api/outsourcing-orders/outsourceable-operations", {
          params: data,
        })

        return response.data
      } catch (error) {
        logHttpError(error, "getOutsourceableOperations")

        throw new Error(resolveGetOutsourceableOperationsErrorMessage(error))
      }
    }
  )

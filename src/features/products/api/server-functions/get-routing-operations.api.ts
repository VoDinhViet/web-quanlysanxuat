import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductOperation } from "@/lib/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetRoutingOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getRoutingOperationsSchema = z.object({ itemId: z.uuid() })

export const getRoutingOperations = createServerFn({ method: "GET" })
  .validator(getRoutingOperationsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<ProductOperation>> => {
    try {
      const response = await http.get<PaginatedResponse<ProductOperation>>(
        `/api/items/${data.itemId}/operations`,
        { params: { limit: 100 } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getRoutingOperations")

      throw new Error(resolveGetRoutingOperationsErrorMessage(error))
    }
  })

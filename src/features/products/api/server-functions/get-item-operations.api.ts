import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductOperation } from "@/lib/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getItemOperations = createServerFn({ method: "GET" })
  .validator(z.object({ itemId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductOperation[]> => {
    try {
      const response = await http.get<ProductOperation[]>(
        `/api/items/${data.itemId}/operations`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getItemOperations")

      throw new Error(resolveGetItemOperationsErrorMessage(error))
    }
  })

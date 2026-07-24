import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductOperation } from "@/features/products/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductOperations = createServerFn({ method: "GET" })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductOperation[]> => {
    try {
      const response = await http.get<ProductOperation[]>(
        `/api/products/${data.productId}/operations`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductOperations")

      throw new Error(resolveGetProductOperationsErrorMessage(error))
    }
  })

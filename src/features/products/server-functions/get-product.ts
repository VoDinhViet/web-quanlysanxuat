import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Product } from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductErrorMessage(error: unknown): string {
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

export const getProduct = createServerFn({ method: "GET" })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }): Promise<Product> => {
    try {
      const response = await http.get<Product>(
        `/api/products/${data.productId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProduct")

      throw new Error(resolveGetProductErrorMessage(error))
    }
  })

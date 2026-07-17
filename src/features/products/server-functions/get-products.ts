import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Product } from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProducts = createServerFn({ method: "GET" })
  .validator(productsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Product>> => {
    try {
      const response = await http.get<PaginatedResponse<Product>>(
        "/api/products",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProducts")

      throw new Error(resolveGetProductsErrorMessage(error))
    }
  })

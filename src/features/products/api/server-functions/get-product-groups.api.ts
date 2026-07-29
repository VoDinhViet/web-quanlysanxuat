import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductGroupRef } from "@/lib/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductGroupsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductGroups = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductGroupRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<ProductGroupRef>>(
        "/api/product-groups",
        { params: { limit: 100 } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getProductGroups")

      throw new Error(resolveGetProductGroupsErrorMessage(error))
    }
  }
)

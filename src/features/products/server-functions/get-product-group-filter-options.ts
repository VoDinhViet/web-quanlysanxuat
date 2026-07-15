import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductFilterOption } from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const FILTER_OPTIONS_LIMIT = 100

function resolveGetFilterOptionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductGroupFilterOptions = createServerFn({
  method: "GET",
}).handler(async (): Promise<ProductFilterOption[]> => {
  try {
    const session = await useAppSession()
    const { accessToken } = session.data

    const response = await http.get<PaginatedResponse<ProductFilterOption>>(
      "/api/product-groups",
      {
        params: { limit: FILTER_OPTIONS_LIMIT },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      }
    )

    return response.data.data
  } catch (error) {
    logHttpError(error, "getProductGroupFilterOptions")

    throw new Error(resolveGetFilterOptionsErrorMessage(error))
  }
})

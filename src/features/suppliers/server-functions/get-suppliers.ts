import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { suppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSuppliersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSuppliers = createServerFn({ method: "GET" })
  .validator(suppliersSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Supplier>> => {
    try {
      const response = await http.get<PaginatedResponse<Supplier>>(
        "/api/suppliers",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getSuppliers")

      throw new Error(resolveGetSuppliersErrorMessage(error))
    }
  })

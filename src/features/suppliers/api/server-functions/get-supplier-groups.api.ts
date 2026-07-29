import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { SupplierGroupRef } from "@/lib/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSupplierGroupsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSupplierGroups = createServerFn({ method: "GET" }).handler(
  async (): Promise<SupplierGroupRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<SupplierGroupRef>>(
        "/api/supplier-groups",
        { params: { limit: 100 } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getSupplierGroups")

      throw new Error(resolveGetSupplierGroupsErrorMessage(error))
    }
  }
)

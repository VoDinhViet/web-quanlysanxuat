import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { supplierReturnsSearchSchema } from "@/features/supplier-returns/schemas/supplier-returns-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { SupplierReturn } from "@/lib/types/supplier-return.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSupplierReturnsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu trả NCC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSupplierReturns = createServerFn({ method: "GET" })
  .validator(supplierReturnsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<SupplierReturn>> => {
    try {
      const response = await http.get<PaginatedResponse<SupplierReturn>>(
        "/api/supplier-returns",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getSupplierReturns")

      throw new Error(resolveGetSupplierReturnsErrorMessage(error))
    }
  })

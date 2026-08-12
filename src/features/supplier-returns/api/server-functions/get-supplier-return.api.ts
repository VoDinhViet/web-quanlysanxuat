import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSupplierReturnErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier_return.error.not_found":
      return "Không tìm thấy phiếu trả NCC."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu trả NCC này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSupplierReturn = createServerFn({ method: "GET" })
  .validator(z.object({ supplierReturnId: z.uuid() }))
  .handler(async ({ data }): Promise<SupplierReturnDetail> => {
    try {
      const response = await http.get<SupplierReturnDetail>(
        `/api/supplier-returns/${data.supplierReturnId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getSupplierReturn")

      throw new Error(resolveGetSupplierReturnErrorMessage(error))
    }
  })

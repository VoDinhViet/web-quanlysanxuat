import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Không tìm thấy nhà cung cấp."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSupplier = createServerFn({ method: "GET" })
  .validator(z.object({ supplierId: z.uuid() }))
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const response = await http.get<Supplier>(
        `/api/suppliers/${data.supplierId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getSupplier")

      throw new Error(resolveGetSupplierErrorMessage(error))
    }
  })

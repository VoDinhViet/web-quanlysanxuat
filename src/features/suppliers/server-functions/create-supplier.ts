import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "supplier.error.code_exists":
      return "Mã nhà cung cấp đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createSupplier = createServerFn({ method: "POST" })
  .validator(createSupplierSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const response = await http.post<Supplier>("/api/suppliers", data)

      return response.data
    } catch (error) {
      logHttpError(error, "createSupplier")

      throw new Error(resolveCreateSupplierErrorMessage(error))
    }
  })

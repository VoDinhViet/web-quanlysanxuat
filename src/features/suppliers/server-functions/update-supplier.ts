import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateSupplierSchema } from "@/features/suppliers/schemas/update-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "supplier.error.code_exists":
      return "Mã nhà cung cấp đã tồn tại."
    case "supplier.error.not_found":
      return "Không tìm thấy nhà cung cấp."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateSupplier = createServerFn({ method: "POST" })
  .validator(updateSupplierSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const { supplierId, ...payload } = data
      const response = await http.patch<Supplier>(
        `/api/suppliers/${supplierId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateSupplier")

      throw new Error(resolveUpdateSupplierErrorMessage(error))
    }
  })

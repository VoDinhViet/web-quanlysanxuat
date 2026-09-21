import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Không tìm thấy nhà cung cấp."
    case "supplier.error.in_use":
      return "Nhà cung cấp đang được sử dụng, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteSupplier = createServerFn({ method: "POST" })
  .validator(z.object({ supplierId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/suppliers/${data.supplierId}`)
    } catch (error) {
      logHttpError(error, "deleteSupplier")

      throw new Error(resolveDeleteSupplierErrorMessage(error))
    }
  })

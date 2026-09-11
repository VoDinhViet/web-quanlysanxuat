import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra khi cập nhật lý do trả hàng."

function resolveUpdateSupplierReturnErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier_return.error.not_found":
      return "Không tìm thấy phiếu trả NCC."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không còn ở trạng thái Chờ xuất, không thể chỉnh sửa."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa phiếu trả NCC."
    default:
      return error.response?.data.message ?? GENERIC_ERROR_MESSAGE
  }
}

const updateSupplierReturnParamsSchema = z.object({
  supplierReturnId: z.string().uuid(),
  returnReason: z.string().max(1000).nullable().optional(),
})

export const updateSupplierReturn = createServerFn({ method: "POST" })
  .validator(updateSupplierReturnParamsSchema)
  .handler(async ({ data }): Promise<SupplierReturnDetail> => {
    try {
      const { supplierReturnId, returnReason } = data
      const response = await http.patch<SupplierReturnDetail>(
        `/api/supplier-returns/${supplierReturnId}`,
        { returnReason }
      )
      return response.data
    } catch (error) {
      logHttpError(error, "updateSupplierReturn")
      throw new Error(resolveUpdateSupplierReturnErrorMessage(error))
    }
  })

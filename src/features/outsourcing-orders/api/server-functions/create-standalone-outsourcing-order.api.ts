import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { standaloneOutsourcingOrderPayloadSchema } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

export function resolveStandaloneOutsourcingOrderErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Nhà cung cấp gia công không tồn tại."
    case "operation.error.not_found":
      return "Công đoạn gia công không tồn tại."
    case "outsourcing_order.error.operation_not_outsource":
      return "Công đoạn đã chọn không phải công đoạn gia công ngoài đang hoạt động."
    case "outsourcing_order.error.items_required":
      return "Phiếu cần ít nhất một dòng hàng gửi gia công."
    case "outsourcing_order.error.duplicate_operation":
      return "Mã hàng bị nhập trùng trong phiếu."
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "outsourcing_order.error.origin_mismatch":
      return "Phiếu này không phải phiếu thủ công."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không còn ở trạng thái sửa được. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền lập hoặc sửa phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createStandaloneOutsourcingOrder = createServerFn({
  method: "POST",
})
  .validator(standaloneOutsourcingOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/outsourcing-orders/standalone", data)
    } catch (error) {
      logHttpError(error, "createStandaloneOutsourcingOrder")

      throw new Error(resolveStandaloneOutsourcingOrderErrorMessage(error))
    }
  })

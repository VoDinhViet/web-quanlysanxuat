import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outsourcingOrderPayloadSchema } from "@/features/outsourcing-orders/schemas/outsourcing-order-payload.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Nhà cung cấp gia công không tồn tại."
    case "outsourcing_order.error.items_required":
      return "Phiếu cần ít nhất một chi tiết cần gia công."
    case "outsourcing_order.error.duplicate_operation":
      return "Có chi tiết bị chọn trùng công đoạn."
    case "outsourcing_order.error.mixed_operations":
      return "Mỗi phiếu chỉ được gửi gia công cùng một công đoạn."
    case "outsourcing_order.error.planned_quantity_exceeded":
      return "Số lượng gửi vượt định mức còn lại của công đoạn. Vui lòng kiểm tra lại số lượng."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(outsourcingOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/outsourcing-orders", data)
    } catch (error) {
      logHttpError(error, "createOutsourcingOrder")

      throw new Error(resolveCreateOutsourcingOrderErrorMessage(error))
    }
  })

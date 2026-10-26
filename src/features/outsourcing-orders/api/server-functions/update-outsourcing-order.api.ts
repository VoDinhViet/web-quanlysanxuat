import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { outsourcingOrderPayloadSchema } from "@/features/outsourcing-orders/schemas/outsourcing-order-payload.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không còn ở trạng thái sửa được. Vui lòng tải lại trang."
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
      return "Bạn không có quyền sửa phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT|REJECTED only — thay toàn bộ header và dòng của phiếu.
export const updateOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      outsourcingOrderId: z.uuid(),
      order: outsourcingOrderPayloadSchema,
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/outsourcing-orders/${data.outsourcingOrderId}`,
        data.order
      )
    } catch (error) {
      logHttpError(error, "updateOutsourcingOrder")

      throw new Error(resolveUpdateOutsourcingOrderErrorMessage(error))
    }
  })

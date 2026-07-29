import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "production_order.error.order_not_approved":
      return "Đơn hàng chưa ở trạng thái chờ sản xuất."
    case "production_order.error.already_issued":
      return "LSX đã được duyệt, không thể sửa."
    case "production_order.error.invalid_order_item":
      return "Có dòng sản phẩm không hợp lệ. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền lưu lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateProductionOrder = createServerFn({ method: "POST" })
  .validator(updateProductionOrderSchema)
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const { orderId, items } = data
      const response = await http.patch<ProductionOrderDetail>(
        `/api/production-orders/${orderId}`,
        { items }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductionOrder")

      throw new Error(resolveUpdateProductionOrderErrorMessage(error))
    }
  })

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
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "order.error.not_found":
      return "Đơn hàng của lệnh sản xuất này không còn tồn tại."
    case "production_order.error.not_editable":
      return "Lệnh sản xuất đã được duyệt nên không thể sửa số lượng."
    case "production_order.error.invalid_order_item":
      return "Có dòng sản phẩm không thuộc lệnh sản xuất này. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Partial update — the backend only touches lines present in `items`, any line not sent keeps
// its saved value. Only valid while the header is PENDING.
export const updateProductionOrder = createServerFn({ method: "POST" })
  .validator(updateProductionOrderSchema)
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const { productionOrderId, items } = data
      const response = await http.patch<ProductionOrderDetail>(
        `/api/production-orders/${productionOrderId}`,
        { items }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductionOrder")

      throw new Error(resolveUpdateProductionOrderErrorMessage(error))
    }
  })

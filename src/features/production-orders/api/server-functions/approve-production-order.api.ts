import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "order.error.not_found":
      return "Đơn hàng của lệnh sản xuất này không còn tồn tại."
    case "production_order.error.invalid_approval_state":
      return "Lệnh sản xuất không còn ở trạng thái Chờ duyệt. Vui lòng tải lại trang."
    case "production_order.error.order_not_approved":
      return "Đơn hàng không còn ở trạng thái Chờ sản xuất. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt lệnh sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING → APPROVED, one-way — backend sinh mã LSX, ghi approvedAt, đồng thời đẩy orders.status
// sang IN_PROGRESS trong cùng transaction. Không có route huỷ duyệt.
export const approveProductionOrder = createServerFn({ method: "POST" })
  .validator(z.object({ productionOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const response = await http.post<ProductionOrderDetail>(
        `/api/production-orders/${data.productionOrderId}/approve`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "approveProductionOrder")

      throw new Error(resolveApproveProductionOrderErrorMessage(error))
    }
  })

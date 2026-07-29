import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveIssueProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "production_order.error.order_not_approved":
      return "Đơn hàng chưa ở trạng thái chờ sản xuất."
    case "production_order.error.already_issued":
      return "LSX đã được duyệt trước đó."
    case "production_order.error.no_items":
      return "Không có dòng sản phẩm nào để duyệt."
    case "stock_receipt.error.insufficient_stock":
      return "Tồn kho khả dụng không đủ để duyệt LSX."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// "Tạo LSX" — the only way to flip a decision from PENDING to ISSUED.
export const issueProductionOrder = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const response = await http.post<ProductionOrderDetail>(
        `/api/production-orders/${data.orderId}/issue`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "issueProductionOrder")

      throw new Error(resolveIssueProductionOrderErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseOrder } from "@/lib/types/purchase-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách đơn mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseOrders = createServerFn({ method: "GET" })
  .validator(purchaseOrdersSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<PurchaseOrder>> => {
    try {
      const response = await http.get<PaginatedResponse<PurchaseOrder>>(
        "/api/purchase-orders",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseOrders")

      throw new Error(resolveGetPurchaseOrdersErrorMessage(error))
    }
  })

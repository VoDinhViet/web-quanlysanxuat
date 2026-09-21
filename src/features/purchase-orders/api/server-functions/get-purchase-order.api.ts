import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đơn mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseOrder = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseOrderDetail> => {
    try {
      const response = await http.get<PurchaseOrderDetail>(
        `/api/purchase-orders/${data.purchaseOrderId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseOrder")

      throw new Error(resolveGetPurchaseOrderErrorMessage(error))
    }
  })

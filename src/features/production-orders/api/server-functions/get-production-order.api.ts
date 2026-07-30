import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionOrder = createServerFn({ method: "GET" })
  .validator(z.object({ productionOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const response = await http.get<ProductionOrderDetail>(
        `/api/production-orders/${data.productionOrderId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionOrder")

      throw new Error(resolveGetProductionOrderErrorMessage(error))
    }
  })

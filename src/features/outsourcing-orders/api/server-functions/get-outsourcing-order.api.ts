import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu gia công ngoài này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingOrder = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<OutsourcingOrderDetail> => {
    try {
      const response = await http.get<OutsourcingOrderDetail>(
        `/api/outsourcing-orders/${data.outsourcingOrderId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingOrder")

      throw new Error(resolveGetOutsourcingOrderErrorMessage(error))
    }
  })

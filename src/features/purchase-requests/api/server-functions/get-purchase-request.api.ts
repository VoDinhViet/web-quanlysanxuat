import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đề xuất mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseRequest = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseRequestDetail> => {
    try {
      const response = await http.get<PurchaseRequestDetail>(
        `/api/purchase-requests/${data.purchaseRequestId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseRequest")

      throw new Error(resolveGetPurchaseRequestErrorMessage(error))
    }
  })

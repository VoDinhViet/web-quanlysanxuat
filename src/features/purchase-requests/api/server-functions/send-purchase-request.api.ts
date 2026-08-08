import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSendPurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.not_editable":
      return "Đề xuất không còn ở trạng thái Nháp. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt đề xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const sendPurchaseRequest = createServerFn({ method: "POST" })
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/purchase-requests/${data.purchaseRequestId}/send`)
    } catch (error) {
      logHttpError(error, "sendPurchaseRequest")

      throw new Error(resolveSendPurchaseRequestErrorMessage(error))
    }
  })

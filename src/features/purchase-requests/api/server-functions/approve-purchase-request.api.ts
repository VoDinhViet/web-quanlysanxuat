import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApprovePurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.invalid_approval_state":
      return "Đề xuất không còn ở trạng thái Chờ duyệt. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt đề xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const approvePurchaseRequest = createServerFn({ method: "POST" })
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-requests/${data.purchaseRequestId}/approve`
      )
    } catch (error) {
      logHttpError(error, "approvePurchaseRequest")

      throw new Error(resolveApprovePurchaseRequestErrorMessage(error))
    }
  })

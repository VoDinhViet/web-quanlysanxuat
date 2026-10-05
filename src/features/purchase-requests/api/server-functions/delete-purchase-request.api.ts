import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeletePurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.not_editable":
      return "Chỉ có thể xóa đề xuất đang ở trạng thái Nháp hoặc Bị từ chối. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền xóa đề xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deletePurchaseRequest = createServerFn({ method: "POST" })
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/purchase-requests/${data.purchaseRequestId}`)
    } catch (error) {
      logHttpError(error, "deletePurchaseRequest")

      throw new Error(resolveDeletePurchaseRequestErrorMessage(error))
    }
  })

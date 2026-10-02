import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { toIsoDate } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateNeededDateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.not_editable":
      return "Đề xuất đã gửi duyệt hoặc đã duyệt, không sửa được ngày cần."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa đề xuất mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePurchaseRequestNeededDate = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      purchaseRequestId: z.uuid(),
      neededDate: z.string().min(1).transform(toIsoDate),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-requests/${data.purchaseRequestId}/needed-date`,
        { neededDate: data.neededDate }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseRequestNeededDate")

      throw new Error(resolveUpdateNeededDateErrorMessage(error))
    }
  })

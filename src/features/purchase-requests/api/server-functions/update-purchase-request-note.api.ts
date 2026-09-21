import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchaseRequestNoteErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa đề xuất mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePurchaseRequestNote = createServerFn({ method: "POST" })
  .validator(
    z.object({
      purchaseRequestId: z.uuid(),
      note: z.string().trim().max(1000).nullable(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-requests/${data.purchaseRequestId}/note`,
        { note: data.note }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseRequestNote")

      throw new Error(resolveUpdatePurchaseRequestNoteErrorMessage(error))
    }
  })

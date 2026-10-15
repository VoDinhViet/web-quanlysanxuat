import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePaymentRequestNoteErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã huỷ, không thể sửa ghi chú."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa ghi chú."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Ghi chú của YCTT (PH-132); sửa được ở mọi trạng thái trừ đã huỷ.
export const updatePaymentRequestNote = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      note: z.string().trim().max(1000).nullable(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/payment-requests/${data.paymentRequestId}/note`, {
        note: data.note,
      })
    } catch (error) {
      logHttpError(error, "updatePaymentRequestNote")

      throw new Error(resolveUpdatePaymentRequestNoteErrorMessage(error))
    }
  })

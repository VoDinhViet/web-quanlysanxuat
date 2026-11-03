import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePaymentRequestFilesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã huỷ, không thể sửa file đính kèm."
    case "file.error.not_found":
      return "Không tìm thấy file vừa tải lên. Vui lòng tải lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa file đính kèm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePaymentRequestFiles = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      fileIds: z.array(z.uuid()).max(20),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/payment-requests/${data.paymentRequestId}/files`, {
        fileIds: data.fileIds,
      })
    } catch (error) {
      logHttpError(error, "updatePaymentRequestFiles")

      throw new Error(resolveUpdatePaymentRequestFilesErrorMessage(error))
    }
  })

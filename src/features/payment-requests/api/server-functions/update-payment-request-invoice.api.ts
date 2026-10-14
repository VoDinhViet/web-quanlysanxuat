import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePaymentRequestInvoiceErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã huỷ, không thể sửa số hóa đơn."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa số hóa đơn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Số hóa đơn NCC do người dùng tự nhập (PH-130); sửa được ở mọi trạng thái trừ đã huỷ.
export const updatePaymentRequestInvoice = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      supplierInvoiceNo: z.string().trim().max(100).nullable(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/payment-requests/${data.paymentRequestId}/invoice`,
        {
          supplierInvoiceNo: data.supplierInvoiceNo,
        }
      )
    } catch (error) {
      logHttpError(error, "updatePaymentRequestInvoice")

      throw new Error(resolveUpdatePaymentRequestInvoiceErrorMessage(error))
    }
  })

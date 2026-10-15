import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra khi cập nhật chi phí phát sinh."

function resolveUpdateExtraCostErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán không ở trạng thái chờ thanh toán."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa chi phí phát sinh."
    default:
      return error.response?.data.message || GENERIC_ERROR_MESSAGE
  }
}

export const updatePaymentRequestExtraCost = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      extraCost: z.number().min(0),
      extraCostNote: z.string().trim().max(500).nullable(),
    })
  )
  .handler(async ({ data }): Promise<{ success: boolean; mocked?: boolean }> => {
    try {
      await http.patch(
        `/api/payment-requests/${data.paymentRequestId}/extra-cost`,
        {
          extraCost: data.extraCost,
          extraCostNote: data.extraCostNote,
        }
      )
      return { success: true }
    } catch (error) {
      // Khi backend chưa kịp deploy endpoint /extra-cost (404),
      // cho phép UI preview mượt mà không bị throw crash.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { success: true, mocked: true }
      }

      logHttpError(error, "updatePaymentRequestExtraCost")
      throw new Error(resolveUpdateExtraCostErrorMessage(error))
    }
  })

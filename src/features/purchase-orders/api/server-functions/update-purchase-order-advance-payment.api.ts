import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateAdvancePaymentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.advance_payment_exceeds_total":
      return "Tiền tạm ứng không được vượt tổng tiền đơn mua."
    case "purchase_order.error.advance_payment_locked":
      return "Đơn mua đã huỷ, không thể sửa tiền tạm ứng."
    case "payment_request.error.already_paid":
      return "Yêu cầu thanh toán của đơn này đã chi, không thể sửa tiền tạm ứng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Tiền tạm ứng/thanh toán trước cho NCC (PH-128): sửa được tới khi YCTT của PO đã chi. BE tự cập
// nhật số đề nghị chi của YCTT đang chờ nên FE chỉ cần tải lại PO và YCTT.
export const updatePurchaseOrderAdvancePayment = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      purchaseOrderId: z.uuid(),
      advancePaymentAmount: z.number().min(0),
      advancePaymentNote: z.string().trim().max(255).nullable().optional(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-orders/${data.purchaseOrderId}/advance-payment`,
        {
          advancePaymentAmount: data.advancePaymentAmount,
          advancePaymentNote: data.advancePaymentNote ?? null,
        }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseOrderAdvancePayment")

      throw new Error(resolveUpdateAdvancePaymentErrorMessage(error))
    }
  })

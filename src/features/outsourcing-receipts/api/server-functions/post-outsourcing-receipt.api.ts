import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolvePostOutsourcingReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.not_found":
      return "Không tìm thấy phiếu nhận gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "outsourcing_receipt.error.quantity_exceeded":
      return "SL nhận vượt quá SL còn lại của phiếu gửi (OS-OUT)."
    case "inventory_document.error.insufficient_stock":
      return "Không thể xác nhận — thao tác sẽ làm tồn một mặt hàng xuống âm."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận đã nhận hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT → POSTED — cộng tồn kho nhận, sinh IQC nếu requiresIqc. Xem
// OutsourcingReceiptDetailActions.tsx.
export const postOutsourcingReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingReceiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-receipts/${data.outsourcingReceiptId}/post`,
        {}
      )
    } catch (error) {
      logHttpError(error, "postOutsourcingReceipt")

      throw new Error(resolvePostOutsourcingReceiptErrorMessage(error))
    }
  })

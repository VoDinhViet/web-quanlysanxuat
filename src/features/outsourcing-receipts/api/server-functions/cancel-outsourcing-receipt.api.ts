import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelOutsourcingReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.not_found":
      return "Không tìm thấy phiếu nhận gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "outsourcing_receipt.error.locked_by_iqc":
      return "Phiếu đã sinh IQC liên kết — không thể huỷ."
    case "inventory_document.error.insufficient_stock":
      return "Không thể huỷ — tồn kho đã bị sử dụng, thao tác sẽ làm tồn âm."
    case "auth.error.forbidden":
      return "Bạn không có quyền huỷ phiếu."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT|POSTED → CANCELLED — đảo bút toán nếu đã POSTED, chặn nếu đã có IQC liên kết. Xem
// OutsourcingReceiptDetailActions.tsx.
export const cancelOutsourcingReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingReceiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-receipts/${data.outsourcingReceiptId}/cancel`,
        {}
      )
    } catch (error) {
      logHttpError(error, "cancelOutsourcingReceipt")

      throw new Error(resolveCancelOutsourcingReceiptErrorMessage(error))
    }
  })

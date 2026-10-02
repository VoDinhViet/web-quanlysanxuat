import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã bị huỷ."
    case "inventory_document.error.insufficient_stock":
      return "Không thể huỷ — vật tư đã nhập có phần đã bị tiêu đi, huỷ sẽ làm tồn xuống âm."
    case "inventory_receipt.error.posted_not_cancellable":
      return "Phiếu đã nhập kho nên không thể hủy. Muốn đảo hàng đã nhập, hãy dùng phiếu trả NCC."
    case "inventory_receipt.error.has_posted_supplier_returns":
      return "Phiếu đã có phiếu trả NCC được ghi sổ nên không thể hủy."
    case "auth.error.forbidden":
      return "Bạn không có quyền huỷ phiếu nhập kho này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Chỉ hủy được phiếu chưa ghi sổ; kéo theo hủy các phiếu IQC của phiếu. Xem
// InventoryReceiptDetailActions.tsx.
export const cancelInventoryReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-receipts/${data.receiptId}/cancel`, {})
    } catch (error) {
      logHttpError(error, "cancelInventoryReceipt")

      throw new Error(resolveCancelInventoryReceiptErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolvePostInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "inventory_document.error.insufficient_stock":
      return "Không thể xác nhận — thao tác sẽ làm tồn một mặt hàng xuống âm."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận nhập kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT → POSTED — sinh bút toán + cập nhật tồn, sau đó phiếu bất biến. Xem
// InventoryReceiptDetailActions.tsx.
export const postInventoryReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-receipts/${data.receiptId}/post`, {})
    } catch (error) {
      logHttpError(error, "postInventoryReceipt")

      throw new Error(resolvePostInventoryReceiptErrorMessage(error))
    }
  })

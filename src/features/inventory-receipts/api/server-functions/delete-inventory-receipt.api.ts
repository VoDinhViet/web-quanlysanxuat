import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không còn ở trạng thái Nháp — không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá phiếu nhập kho này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteInventoryReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/inventory-receipts/${data.receiptId}`)
    } catch (error) {
      logHttpError(error, "deleteInventoryReceipt")

      throw new Error(resolveDeleteInventoryReceiptErrorMessage(error))
    }
  })

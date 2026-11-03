import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateInventoryReceiptFilesErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu nhập kho đã huỷ, không thể sửa file đính kèm."
    case "file.error.not_found":
      return "Không tìm thấy file vừa tải lên. Vui lòng tải lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa file đính kèm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateInventoryReceiptFiles = createServerFn({ method: "POST" })
  .validator(
    z.object({
      receiptId: z.uuid(),
      fileIds: z.array(z.uuid()).max(20),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/inventory-receipts/${data.receiptId}/files`, {
        fileIds: data.fileIds,
      })
    } catch (error) {
      logHttpError(error, "updateInventoryReceiptFiles")

      throw new Error(resolveUpdateInventoryReceiptFilesErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingReceiptItem } from "@/lib/types/outsourcing-receipt.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingReceiptItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.not_found":
      return "Không tìm thấy phiếu nhận gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem chi tiết phiếu nhận gia công ngoài này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingReceiptItems = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingReceiptId: z.uuid() }))
  .handler(async ({ data }): Promise<OutsourcingReceiptItem[]> => {
    try {
      const response = await http.get<OutsourcingReceiptItem[]>(
        `/api/outsourcing-receipts/${data.outsourcingReceiptId}/items`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingReceiptItems")

      throw new Error(resolveGetOutsourcingReceiptItemsErrorMessage(error))
    }
  })

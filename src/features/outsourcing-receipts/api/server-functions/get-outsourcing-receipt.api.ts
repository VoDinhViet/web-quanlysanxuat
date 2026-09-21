import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.not_found":
      return "Không tìm thấy phiếu nhận gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu nhận gia công ngoài này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingReceipt = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingReceiptId: z.uuid() }))
  .handler(async ({ data }): Promise<OutsourcingReceiptDetail> => {
    try {
      const response = await http.get<OutsourcingReceiptDetail>(
        `/api/outsourcing-receipts/${data.outsourcingReceiptId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingReceipt")

      throw new Error(resolveGetOutsourcingReceiptErrorMessage(error))
    }
  })

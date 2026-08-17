import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outsourcingReceiptsSearchSchema } from "@/features/outsourcing-receipts/schemas/outsourcing-receipts-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingReceipt } from "@/lib/types/outsourcing-receipt.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingReceiptsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu nhận gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingReceipts = createServerFn({ method: "GET" })
  .validator(outsourcingReceiptsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OutsourcingReceipt>> => {
    try {
      const response = await http.get<PaginatedResponse<OutsourcingReceipt>>(
        "/api/outsourcing-receipts",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingReceipts")

      throw new Error(resolveGetOutsourcingReceiptsErrorMessage(error))
    }
  })

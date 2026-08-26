import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { toUtcVnDayStart } from "@/lib/zod-transforms"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// `createdAt` (cột timestamp) cần instant UTC đúng ranh giới ngày giờ VN — startDate/endDate vốn là
// "yyyy-MM-dd" giờ VN từ DateRangePicker, phải quy đổi trước khi gửi BE.
const getPurchaseQuotationsParamsSchema = purchaseQuotationsSearchSchema.transform(
  ({ startDate, endDate, ...rest }) => ({
    ...rest,
    startDate: startDate ? toUtcVnDayStart(startDate) : undefined,
    endDate: endDate ? toUtcVnDayStart(endDate) : undefined,
  })
)

function resolveGetPurchaseQuotationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách báo giá."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseQuotations = createServerFn({ method: "GET" })
  .validator(getPurchaseQuotationsParamsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<PurchaseQuotationRow>> => {
      try {
        const response = await http.get<
          PaginatedResponse<PurchaseQuotationRow>
        >("/api/purchase-quotations", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getPurchaseQuotations")

        throw new Error(resolveGetPurchaseQuotationsErrorMessage(error))
      }
    }
  )

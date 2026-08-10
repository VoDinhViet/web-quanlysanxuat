import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseQuotationApiRow } from "@/lib/types/purchase-quotation.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `quotationDateFrom`/`quotationDateTo` rename to `fromDate`/`toDate` — a real range on
// GetQuotationsReqDto, same idiom as purchase-ledger's createdDateFrom/To rename.
const getPurchaseQuotationsParamsSchema =
  purchaseQuotationsSearchSchema.transform(
    ({ quotationDateFrom, quotationDateTo, ...rest }) => ({
      ...rest,
      fromDate: quotationDateFrom,
      toDate: quotationDateTo,
    })
  )

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

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
    async ({ data }): Promise<PaginatedResponse<PurchaseQuotationApiRow>> => {
      try {
        const response = await http.get<
          PaginatedResponse<PurchaseQuotationApiRow>
        >("/api/purchase-quotations", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getPurchaseQuotations")

        throw new Error(resolveGetPurchaseQuotationsErrorMessage(error))
      }
    }
  )

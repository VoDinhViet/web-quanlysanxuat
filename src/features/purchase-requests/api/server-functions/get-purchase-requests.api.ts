import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseRequestsSearchSchema } from "@/features/purchase-requests/schemas/purchase-requests-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseRequest } from "@/lib/types/purchase-request.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseRequestsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách đề xuất mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseRequests = createServerFn({ method: "GET" })
  .validator(purchaseRequestsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<PurchaseRequest>> => {
    try {
      const response = await http.get<PaginatedResponse<PurchaseRequest>>(
        "/api/purchase-requests",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseRequests")

      throw new Error(resolveGetPurchaseRequestsErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { PurchaseOrder } from "@/lib/types/purchase-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseOrdersByQuotationErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đơn mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Narrow read for the RFQ detail page's "Đơn mua đã sinh" card — a quotation generates at most
// a few POs (one per distinct winning supplier), so this drops `pagination` and just returns
// `data`. Separate from this feature's own `purchaseOrdersQueryOptions` (page-search-driven) only
// because this read has no pagination UI of its own, not because the underlying API differs —
// both hit the same GET /purchase-orders, just with a different filter (`quotationId` vs the
// list page's full search schema).
export const getPurchaseOrdersByQuotation = createServerFn({ method: "GET" })
  .validator(z.object({ quotationId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseOrder[]> => {
    try {
      const response = await http.get<PaginatedResponse<PurchaseOrder>>(
        "/api/purchase-orders",
        {
          params: { quotationId: data.quotationId, limit: 50 },
        }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getPurchaseOrdersByQuotation")

      throw new Error(resolveGetPurchaseOrdersByQuotationErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseLedgerApiRow } from "@/lib/types/purchase-ledger.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `q` (the single search box) renames to `materialKeyword` — GetPurchaseLedgerReqDto's own `q`
// only matches purchase_requests.code, and ANDing it together with `materialKeyword` would
// require a row to match BOTH instead of the "search across fields" the box implies, so only one
// can be wired: `materialKeyword` fits this vật-tư-tracking table better. `neededDateFrom` renames
// to `neededDate` — the backend only supports an exact-day match here, not a range, so only "từ
// ngày" ends up filtering; `neededDateTo` is dropped rather than sent. `createdDateFrom`/
// `createdDateTo` rename to `fromDate`/`toDate` (a real range, same idiom as orders/
// purchase-requests own fromDate/toDate rename).
const getPurchaseLedgerParamsSchema = purchaseLedgerSearchSchema.transform(
  ({
    q,
    createdDateFrom,
    createdDateTo,
    neededDateFrom,
    neededDateTo: _neededDateTo,
    ...rest
  }) => ({
    ...rest,
    materialKeyword: q,
    fromDate: createdDateFrom,
    toDate: createdDateTo,
    neededDate: neededDateFrom,
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseLedgerErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem sổ cái mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseLedger = createServerFn({ method: "GET" })
  .validator(getPurchaseLedgerParamsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<PurchaseLedgerApiRow>> => {
      try {
        const response = await http.get<
          PaginatedResponse<PurchaseLedgerApiRow>
        >("/api/purchase-ledger", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getPurchaseLedger")

        throw new Error(resolveGetPurchaseLedgerErrorMessage(error))
      }
    }
  )

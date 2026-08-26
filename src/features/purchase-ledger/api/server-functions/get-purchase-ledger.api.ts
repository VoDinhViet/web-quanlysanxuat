import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { toUtcVnDayStart } from "@/lib/zod-transforms"
import type { PurchaseLedgerApiRow } from "@/lib/types/purchase-ledger.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// `createdAt` (cột timestamp) cần instant UTC đúng ranh giới ngày giờ VN — không đụng
// neededStartDate/neededEndDate, lọc lên `neededDate` là cột `date`, gửi nguyên chuỗi.
const getPurchaseLedgerParamsSchema = purchaseLedgerSearchSchema.transform(
  ({ createdStartDate, createdEndDate, ...rest }) => ({
    ...rest,
    createdStartDate: createdStartDate
      ? toUtcVnDayStart(createdStartDate)
      : undefined,
    createdEndDate: createdEndDate
      ? toUtcVnDayStart(createdEndDate)
      : undefined,
  })
)

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

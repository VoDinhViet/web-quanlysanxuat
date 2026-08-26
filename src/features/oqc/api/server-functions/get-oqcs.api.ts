import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { oqcSearchSchema } from "@/features/oqc/schemas/oqc-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { toUtcVnDayStart } from "@/lib/zod-transforms"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Oqc } from "@/lib/types/oqc.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// `inspectionDate` (cột timestamp) cần instant UTC đúng ranh giới ngày giờ VN — startDate/endDate
// vốn là "yyyy-MM-dd" giờ VN từ DateRangePicker, phải quy đổi trước khi gửi BE.
const getOqcsParamsSchema = oqcSearchSchema.transform(
  ({ startDate, endDate, ...rest }) => ({
    ...rest,
    startDate: startDate ? toUtcVnDayStart(startDate) : undefined,
    endDate: endDate ? toUtcVnDayStart(endDate) : undefined,
  })
)

function resolveGetOqcsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu OQC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOqcs = createServerFn({ method: "GET" })
  .validator(getOqcsParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Oqc>> => {
    try {
      const response = await http.get<PaginatedResponse<Oqc>>("/api/oqc", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getOqcs")

      throw new Error(resolveGetOqcsErrorMessage(error))
    }
  })

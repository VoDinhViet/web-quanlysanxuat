import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OqcDetail } from "@/lib/types/oqc.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "oqc_inspection.error.not_found":
      return "Không tìm thấy phiếu OQC."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu OQC này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOqc = createServerFn({ method: "GET" })
  .validator(z.object({ oqcId: z.uuid() }))
  .handler(async ({ data }): Promise<OqcDetail> => {
    try {
      const response = await http.get<OqcDetail>(`/api/oqc/${data.oqcId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getOqc")

      throw new Error(resolveGetOqcErrorMessage(error))
    }
  })

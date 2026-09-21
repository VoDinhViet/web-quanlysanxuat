import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { QcPassRatePoint } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetQcPassRateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem tỷ lệ đạt QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getQcPassRate = createServerFn({ method: "GET" }).handler(
  async (): Promise<QcPassRatePoint[]> => {
    try {
      const response = await http.get<QcPassRatePoint[]>(
        "/api/reports/qc-pass-rate"
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getQcPassRate")

      throw new Error(resolveGetQcPassRateErrorMessage(error))
    }
  }
)

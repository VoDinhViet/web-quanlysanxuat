import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OpenNcr } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOpenNcrErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách NCR chưa xử lý."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOpenNcr = createServerFn({ method: "GET" }).handler(
  async (): Promise<OpenNcr[]> => {
    try {
      const response = await http.get<OpenNcr[]>("/api/reports/open-ncr")

      return response.data
    } catch (error) {
      logHttpError(error, "getOpenNcr")

      throw new Error(resolveGetOpenNcrErrorMessage(error))
    }
  }
)

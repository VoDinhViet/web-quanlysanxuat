import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ReportAlerts } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetReportAlertsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem cảnh báo tổng quan."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getReportAlerts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReportAlerts> => {
    try {
      const response = await http.get<ReportAlerts>("/api/reports/alerts")

      return response.data
    } catch (error) {
      logHttpError(error, "getReportAlerts")

      throw new Error(resolveGetReportAlertsErrorMessage(error))
    }
  }
)

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ReportStats } from "@/lib/types/report.type"

// Independent of any one consumer's search schema — `/manage`'s date range is the only caller
// today, but this validator only knows about the wire shape GetReportStatsReqDto expects.
const getReportStatsParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetReportStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem báo cáo tổng quan."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getReportStats = createServerFn({ method: "GET" })
  .validator(getReportStatsParamsSchema)
  .handler(async ({ data }): Promise<ReportStats> => {
    try {
      const response = await http.get<ReportStats>("/api/reports/stats", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getReportStats")

      throw new Error(resolveGetReportStatsErrorMessage(error))
    }
  })

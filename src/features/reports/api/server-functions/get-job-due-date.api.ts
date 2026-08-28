import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { JobDueDate } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetJobDueDateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách Job trễ hạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getJobDueDate = createServerFn({ method: "GET" }).handler(
  async (): Promise<JobDueDate[]> => {
    try {
      const response = await http.get<JobDueDate[]>("/api/reports/job-due-date")

      return response.data
    } catch (error) {
      logHttpError(error, "getJobDueDate")

      throw new Error(resolveGetJobDueDateErrorMessage(error))
    }
  }
)

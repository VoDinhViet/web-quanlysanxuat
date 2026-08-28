import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingOrderDueDate } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingOrderDueDateErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách gia công ngoài trễ hạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingOrderDueDate = createServerFn({
  method: "GET",
}).handler(async (): Promise<OutsourcingOrderDueDate[]> => {
  try {
    const response = await http.get<OutsourcingOrderDueDate[]>(
      "/api/reports/outsourcing-order-due-date"
    )

    return response.data
  } catch (error) {
    logHttpError(error, "getOutsourcingOrderDueDate")

    throw new Error(resolveGetOutsourcingOrderDueDateErrorMessage(error))
  }
})

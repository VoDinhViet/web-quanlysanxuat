import { createServerFn } from "@tanstack/react-start"

import { http, logHttpError } from "@/lib/http"
import type { PendingApprovals } from "@/lib/types/report.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

export const getPendingApprovals = createServerFn({ method: "GET" }).handler(
  async (): Promise<PendingApprovals> => {
    try {
      const response = await http.get<PendingApprovals>(
        "/api/reports/pending-approvals"
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPendingApprovals")

      throw new Error(GENERIC_ERROR_MESSAGE)
    }
  }
)

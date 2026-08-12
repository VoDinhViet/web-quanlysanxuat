import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { resolveIqcSchema } from "@/features/iqc/schemas/resolve-iqc.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveResolveIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "iqc_inspection.error.not_found":
      return "Không tìm thấy phiếu IQC."
    case "iqc_inspection.error.not_pending":
      return "Dòng IQC này không còn ở trạng thái Chờ xử lý. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền xử lý QC FAIL."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING → COMPLETED (CONCESSION) / WAITING_RETURN (SORT/RETURN) — see IqcDispositionCard.tsx.
export const resolveIqc = createServerFn({ method: "POST" })
  .validator(resolveIqcSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/iqc/${data.iqcId}/resolve`, {
        disposition: data.disposition,
      })
    } catch (error) {
      logHttpError(error, "resolveIqc")

      throw new Error(resolveResolveIqcErrorMessage(error))
    }
  })

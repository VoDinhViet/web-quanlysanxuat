import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { confirmOqcSchema } from "@/features/oqc/schemas/confirm-oqc.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmOqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "oqc_inspection.error.not_found":
      return "Không tìm thấy phiếu OQC."
    case "oqc_inspection.error.already_completed":
      return "Phiếu đã hoàn tất — không thể sửa kết quả nữa."
    case "auth.error.forbidden":
      return "Bạn không có quyền lưu kết quả QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Nút "Lưu" duy nhất của trang chi tiết OQC — gọi lại được nhiều lần, trừ khi dòng đã COMPLETED
// (khoá vĩnh viễn, khác IQC — không có route "un-complete", xem OqcDetailForm.tsx).
export const confirmOqc = createServerFn({ method: "POST" })
  .validator(confirmOqcSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { oqcId, ...payload } = data
      await http.post(`/api/oqc/${oqcId}/confirm`, payload)
    } catch (error) {
      logHttpError(error, "confirmOqc")

      throw new Error(resolveConfirmOqcErrorMessage(error))
    }
  })

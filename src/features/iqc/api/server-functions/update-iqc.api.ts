import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateIqcSchema } from "@/features/iqc/schemas/update-iqc.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "iqc_inspection.error.not_found":
      return "Không tìm thấy phiếu IQC."
    case "iqc_inspection.error.not_yet_confirmed":
      return "Phiếu IQC này chưa được xác nhận QC. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa thông tin kiểm tra."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Sửa lại 4 field ngữ cảnh sau khi đã confirm — see IqcAqlInputCard.tsx's edit toggle.
export const updateIqc = createServerFn({ method: "POST" })
  .validator(updateIqcSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/iqc/${data.iqcId}`, {
        inspectionStandard: data.inspectionStandard,
        inspectorName: data.inspectorName,
        measuringTools: data.measuringTools,
        inspectionDate: data.inspectionDate,
      })
    } catch (error) {
      logHttpError(error, "updateIqc")

      throw new Error(resolveUpdateIqcErrorMessage(error))
    }
  })

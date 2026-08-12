import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { confirmIqcSchema } from "@/features/iqc/schemas/confirm-iqc.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "iqc_inspection.error.not_found":
      return "Không tìm thấy phiếu IQC."
    case "iqc_inspection.error.already_inspected":
      return "Phiếu IQC này đã được xác nhận QC. Vui lòng tải lại trang."
    case "iqc_inspection.error.invalid_aql_combination":
      return "Không tra được cỡ mẫu cho tổ hợp Inspection Level/AQL Level này."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// NOT_INSPECTED → COMPLETED/PENDING — see IqcAqlInputCard.tsx. `result` isn't part of the
// payload: the server always computes it from `defectQty` vs the Ac/Re it looks up itself.
export const confirmIqc = createServerFn({ method: "POST" })
  .validator(confirmIqcSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/iqc/${data.iqcId}/confirm`, {
        inspectionLevel: data.inspectionLevel,
        aqlLevel: data.aqlLevel,
        sampleSize: data.sampleSize,
        defectQty: data.defectQty,
        inspectionStandard: data.inspectionStandard,
        inspectorName: data.inspectorName,
        measuringTools: data.measuringTools,
        inspectionDate: data.inspectionDate,
      })
    } catch (error) {
      logHttpError(error, "confirmIqc")

      throw new Error(resolveConfirmIqcErrorMessage(error))
    }
  })

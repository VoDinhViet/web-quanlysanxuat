import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { confirmOqcSchema } from "@/features/oqc/schemas/confirm-oqc.schema"
import { resolveApiFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import { IqcResult } from "@/lib/types/iqc.type"
import type { ApiErrorResponse } from "@/lib/http"

// PASS force-drops disposition/dispositionNote/dispositionEvidence regardless of whatever the
// (hidden) form fields still hold — OqcDispositionCard/OqcEvidenceCard (dispositionEvidence) stop
// rendering once `result` flips back to PASS, but their fields keep their last value in form
// state until submit, same idiom as confirm-iqc.api.ts. `qcEvidence`/`dispositionEvidence`
// collapse to `*FileIds`, same idiom as every other file field.
const confirmOqcPayloadSchema = confirmOqcSchema.transform(
  ({
    disposition,
    dispositionNote,
    qcEvidence,
    dispositionEvidence,
    ...rest
  }) => {
    const isPass = rest.result === IqcResult.PASS

    return {
      ...rest,
      qcEvidenceFileIds: resolveApiFileIds(qcEvidence),
      disposition: isPass ? undefined : disposition,
      dispositionNote: isPass ? undefined : dispositionNote,
      dispositionEvidenceFileIds: isPass
        ? []
        : resolveApiFileIds(dispositionEvidence),
    }
  }
)

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
    case "oqc_inspection.error.aql_plan_not_found":
      return "Không tra được bảng AQL cho tổ hợp này — vui lòng tự chọn Kết quả (PASS/FAIL)."
    case "oqc_inspection.error.result_override_reason_required":
      return "Kết quả bạn chọn khác gợi ý tự động — vui lòng nhập ghi chú kết quả."
    case "oqc_inspection.error.disposition_not_allowed_for_pass":
      return "Kết quả PASS thì không được chọn phương án xử lý."
    case "file.error.not_found":
      return "File bằng chứng không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền lưu kết quả QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Nút "Lưu" duy nhất của trang chi tiết OQC — gọi lại được nhiều lần, trừ khi dòng đã COMPLETED
// (khoá vĩnh viễn, khác IQC — không có route "un-complete", xem OqcDetailForm.tsx).
export const confirmOqc = createServerFn({ method: "POST" })
  .validator(confirmOqcPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { oqcId, ...payload } = data
      await http.post(`/api/oqc/${oqcId}/confirm`, payload)
    } catch (error) {
      logHttpError(error, "confirmOqc")

      throw new Error(resolveConfirmOqcErrorMessage(error))
    }
  })

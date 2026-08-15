import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { confirmIqcSchema } from "@/features/iqc/schemas/confirm-iqc.schema"
import { resolveApiAttachmentFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import { IqcResult } from "@/lib/types/iqc.type"
import type { ApiErrorResponse } from "@/lib/http"

// `totalQuantity` is FE-only (see confirm-iqc.schema.ts) — dropped here, never sent.
// `qcEvidence`/`dispositionEvidence` collapse to `*FileIds`, same idiom as every other
// attachments field (see createOrderPayloadSchema). PASS force-drops the whole disposition
// group regardless of whatever the (hidden) form fields still hold — IqcDispositionCard stops
// rendering once `result` flips back to PASS, but its fields keep their last value in form
// state until submit, so this is the one place that actually enforces "PASS has no disposition".
const confirmIqcPayloadSchema = confirmIqcSchema.transform(
  ({ totalQuantity, qcEvidence, dispositionEvidence, ...rest }) => {
    const isPass = rest.result === IqcResult.PASS

    return {
      ...rest,
      qcEvidenceFileIds: resolveApiAttachmentFileIds(qcEvidence),
      disposition: isPass ? undefined : rest.disposition,
      sortOkQty: isPass ? undefined : rest.sortOkQty,
      sortNgQty: isPass ? undefined : rest.sortNgQty,
      dispositionNote: isPass ? undefined : rest.dispositionNote,
      dispositionEvidenceFileIds: isPass
        ? []
        : resolveApiAttachmentFileIds(dispositionEvidence),
    }
  }
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "iqc_inspection.error.not_found":
      return "Không tìm thấy phiếu IQC."
    case "iqc_inspection.error.locked_for_return":
      return "Phiếu IQC này đã chốt đường trả NCC, không thể sửa lại kết quả."
    case "iqc_inspection.error.disposition_not_allowed_for_pass":
      return "Kết quả PASS thì không được chọn phương án xử lý."
    case "iqc_inspection.error.sort_quantity_mismatch":
      return "SL OK + SL NG phải bằng đúng Tổng SL."
    case "iqc_inspection.error.sort_quantity_not_allowed":
      return "Chỉ nhập SL OK/SL NG khi chọn phương án Phân loại."
    case "iqc_inspection.error.sort_quantity_required":
      return "Vui lòng nhập đủ SL OK và SL NG cho phương án Phân loại."
    case "iqc_inspection.error.missing_warehouse_for_return":
      return "Không xác định được kho nhận hàng trả — kiểm tra lại phiếu nhập/PO liên quan."
    case "department.error.not_found":
      return "Bộ phận QC đã chọn không tồn tại."
    case "file.error.not_found":
      return "File bằng chứng không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền lưu kết quả QC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Nút "Lưu" duy nhất của trang chi tiết IQC — gọi lại được nhiều lần (không dùng-một-lần), trừ
// khi dòng đã WAITING_RETURN (khoá, xem IqcDetailForm.tsx). Khi status tính ra WAITING_RETURN,
// backend tự sinh phiếu trả NCC (DRAFT) trong cùng transaction — xem docs/workflows/supplier-return.md.
export const confirmIqc = createServerFn({ method: "POST" })
  .validator(confirmIqcPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { iqcId, ...payload } = data
      await http.post(`/api/iqc/${iqcId}/confirm`, payload)
    } catch (error) {
      logHttpError(error, "confirmIqc")

      throw new Error(resolveConfirmIqcErrorMessage(error))
    }
  })

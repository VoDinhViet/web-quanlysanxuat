import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { fileFieldSchema, resolveApiFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolvePostSupplierReturnErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier_return.error.not_found":
      return "Không tìm thấy phiếu trả NCC."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "inventory_document.error.insufficient_stock":
      return "Không thể xác nhận — thao tác sẽ làm tồn một mặt hàng xuống âm."
    case "iqc_inspection.error.not_waiting_return":
      return "Phiếu IQC liên kết không còn ở trạng thái Chờ trả NCC. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận xuất trả."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `note`/`files` tuỳ chọn — bằng chứng xuất trả, cùng khuôn
// create-job-operation-report.api.ts (`files` → `fileIds` qua resolveApiFileIds).
const postSupplierReturnParamsSchema = z
  .object({
    supplierReturnId: z.uuid(),
    note: z.string().trim().max(500).optional(),
    files: z.array(fileFieldSchema).default([]),
  })
  .transform(({ files, ...rest }) => ({
    ...rest,
    fileIds: resolveApiFileIds(files),
  }))

// DRAFT → POSTED — trừ tồn (nếu phiếu nhập gốc liên kết đã POSTED, xem
// docs/workflows/supplier-return.md) và tự chuyển IQC liên kết sang Hoàn thành. Xem
// SupplierReturnDetailActions.tsx.
export const postSupplierReturn = createServerFn({ method: "POST" })
  .validator(postSupplierReturnParamsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { supplierReturnId, ...body } = data
      await http.post(`/api/supplier-returns/${supplierReturnId}/post`, body)
    } catch (error) {
      logHttpError(error, "postSupplierReturn")

      throw new Error(resolvePostSupplierReturnErrorMessage(error))
    }
  })

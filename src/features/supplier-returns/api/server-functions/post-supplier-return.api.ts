import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

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

// DRAFT → POSTED — trừ tồn (nếu phiếu nhập gốc liên kết đã POSTED, xem
// docs/workflows/supplier-return.md) và tự chuyển IQC liên kết sang Hoàn thành. Xem
// SupplierReturnDetailActions.tsx.
export const postSupplierReturn = createServerFn({ method: "POST" })
  .validator(z.object({ supplierReturnId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/supplier-returns/${data.supplierReturnId}/post`, {})
    } catch (error) {
      logHttpError(error, "postSupplierReturn")

      throw new Error(resolvePostSupplierReturnErrorMessage(error))
    }
  })

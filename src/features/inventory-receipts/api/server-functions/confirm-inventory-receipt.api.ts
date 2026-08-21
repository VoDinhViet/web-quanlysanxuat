import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "inventory_document.error.no_items":
      return "Phiếu chưa có dòng vật tư nào."
    case "inventory_receipt.error.missing_supplier_for_iqc":
      return "Thiếu nhà cung cấp để tạo phiếu IQC — vui lòng chọn PO có NCC."
    case "inventory_receipt.error.oqc_not_completed":
      return "Job chưa có phiếu OQC nào, hoặc còn phiếu OQC chưa hoàn thành — chưa thể nhập kho."
    case "inventory_receipt.error.job_planned_quantity_exceeded":
      return "Tổng SL nhập kho của Job này vượt SL kế hoạch."
    case "inventory_receipt.error.final_oqc_missing":
      return "Job chưa được QC thành phẩm (bước Lắp ráp) — chưa thể nhập kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận phiếu nhập kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT → PENDING_RECEIPT/PENDING_IQC — quyết định theo `requiresIqc` đã lưu trên phiếu (không
// truyền lên đây), sinh kèm phiếu IQC cho mỗi dòng nếu true. Gọi từ
// InventoryReceiptCreateFromPoForm.tsx (ngay sau createInventoryReceipt khi chọn "Xác nhận" thay
// vì "Lưu nháp") và từ InventoryReceiptDetailActions.tsx (nút "Xác nhận" trên phiếu DRAFT có sẵn).
export const confirmInventoryReceipt = createServerFn({ method: "POST" })
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-receipts/${data.receiptId}/confirm`, {})
    } catch (error) {
      logHttpError(error, "confirmInventoryReceipt")

      throw new Error(resolveConfirmInventoryReceiptErrorMessage(error))
    }
  })

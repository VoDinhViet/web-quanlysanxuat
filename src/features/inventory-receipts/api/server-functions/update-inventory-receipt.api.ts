import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không còn ở trạng thái Nháp — không thể sửa."
    case "inventory_document.error.item_not_found":
      return "Một vật tư trong phiếu không tồn tại."
    case "inventory_document.error.invalid_reference":
      return "Nhà cung cấp/đề xuất mua/LSX tham chiếu không tồn tại."
    case "purchase_order.error.not_found":
      return "Đơn mua hàng không tồn tại."
    case "purchase_order.error.not_ordered":
      return "Đơn mua hàng chưa ở trạng thái đã đặt hàng (ORDERED)."
    case "purchase_order_item.error.not_found":
      return "Dòng đơn mua hàng không tồn tại."
    case "purchase_order.error.receipt_item_mismatch":
      return "Dòng đơn mua hàng không thuộc đơn mua đã chọn."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa phiếu nhập kho này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Chỉ hợp lệ khi phiếu còn DRAFT — xem InventoryReceiptUpdateForm.tsx. Không trả về entity
// vừa sửa — nơi gọi tự invalidate rồi đọc lại qua query cache.
export const updateInventoryReceipt = createServerFn({ method: "POST" })
  .validator(updateInventoryReceiptSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { receiptId, ...body } = data
      await http.patch(`/api/inventory-receipts/${receiptId}`, body)
    } catch (error) {
      logHttpError(error, "updateInventoryReceipt")

      throw new Error(resolveUpdateInventoryReceiptErrorMessage(error))
    }
  })

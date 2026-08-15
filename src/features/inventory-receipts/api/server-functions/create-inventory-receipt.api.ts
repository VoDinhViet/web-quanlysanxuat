import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateInventoryReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "warehouse.error.not_found":
      return "Kho nhận không tồn tại."
    case "warehouse.error.inactive":
      return "Kho nhận không còn hoạt động."
    case "inventory_document.error.code_exists":
      return "Mã phiếu nhập kho đã tồn tại."
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
      return "Bạn không có quyền tạo phiếu nhập kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Luôn tạo ở DRAFT, chưa đụng tồn kho — xem InventoryReceiptCreateForm.tsx. Trả về id vừa tạo:
// form chung tự invalidate rồi điều hướng, không đọc id, nhưng
// InventoryReceiptCreateFromPoForm.tsx cần id để gọi confirmInventoryReceipt ngay sau đó khi
// người dùng chọn "Xác nhận" thay vì "Lưu nháp".
export const createInventoryReceipt = createServerFn({ method: "POST" })
  .validator(createInventoryReceiptSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    try {
      const response = await http.post<{ id: string }>(
        "/api/inventory-receipts",
        data
      )

      return { id: response.data.id }
    } catch (error) {
      logHttpError(error, "createInventoryReceipt")

      throw new Error(resolveCreateInventoryReceiptErrorMessage(error))
    }
  })

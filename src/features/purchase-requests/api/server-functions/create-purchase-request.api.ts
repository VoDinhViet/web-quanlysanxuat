import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreatePurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.no_items":
      return "Đề xuất cần ít nhất một dòng vật tư."
    case "purchase_request_item.error.duplicate_item":
      return "Vật tư bị trùng lặp trong đề xuất."
    case "purchase_request_item.error.item_not_raw_material":
      return "Vật tư được chọn không phải nguyên vật liệu."
    case "department.error.not_found":
      return "Phòng ban không tồn tại."
    case "item.error.not_found":
      return "Vật tư không tồn tại."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Luôn tạo ở DRAFT. POST /api/purchase-requests trả 204 No Content (void) — không có {id} như
// createOrder/createInventoryReceipt cũng trả void, nên PurchaseRequestCreateForm điều hướng về
// danh sách sau khi tạo, không có id để vào thẳng trang chi tiết.
export const createPurchaseRequest = createServerFn({ method: "POST" })
  .validator(createPurchaseRequestSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/purchase-requests", data)
    } catch (error) {
      logHttpError(error, "createPurchaseRequest")

      throw new Error(resolveCreatePurchaseRequestErrorMessage(error))
    }
  })

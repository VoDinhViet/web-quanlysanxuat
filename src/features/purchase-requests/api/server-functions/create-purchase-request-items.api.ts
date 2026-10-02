import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPurchaseRequestItemsSchema } from "@/features/purchase-requests/schemas/create-purchase-request-items.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreatePurchaseRequestItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.not_editable":
      return "Chỉ có thể thêm vật tư khi đề xuất đang ở trạng thái Nháp hoặc Bị từ chối."
    case "purchase_request.error.no_items":
      return "Vui lòng chọn ít nhất một vật tư."
    case "purchase_request_item.error.duplicate_item":
      return "Có vật tư bị chọn trùng nhau."
    case "purchase_request.error.item_already_in_request":
      return "Có vật tư đã nằm trong đề xuất này. Muốn đổi số lượng thì sửa dòng hiện có."
    case "purchase_request_item.error.item_not_direct":
      return "Chỉ thêm được vật tư trực tiếp vào đề xuất mua hàng."
    case "item.error.not_found":
      return "Có vật tư không còn tồn tại. Vui lòng tải lại danh sách."
    case "auth.error.forbidden":
      return "Bạn không có quyền thêm vật tư vào đề xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createPurchaseRequestItems = createServerFn({ method: "POST" })
  .validator(createPurchaseRequestItemsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-requests/${data.purchaseRequestId}/items`,
        {
          items: data.items,
        }
      )
    } catch (error) {
      logHttpError(error, "createPurchaseRequestItems")

      throw new Error(resolveCreatePurchaseRequestItemsErrorMessage(error))
    }
  })

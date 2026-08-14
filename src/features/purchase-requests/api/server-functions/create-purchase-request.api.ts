import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// POST /api/purchase-requests chưa tồn tại trên backend tại thời điểm viết (xem comment
// "giai đoạn 1 chỉ có GET /purchase-requests" trong PurchaseRequestsPage.tsx) — endpoint và
// payload giả định theo đúng pattern các luồng purchasing khác (vd createInventoryReceipt).
// errorCode thật sẽ bổ sung vào switch dưới đây khi backend triển khai xong; tạm thời chỉ
// có nhánh default.
function resolveCreatePurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

type CreatePurchaseRequestResult = {
  id: string
}

// Luôn tạo ở DRAFT. Khác createOrder/createInventoryReceipt (trả void): trả về {id} vì
// PurchaseRequestCreateForm điều hướng thẳng sang trang chi tiết vừa tạo (để gửi duyệt
// ngay), không quay về danh sách.
export const createPurchaseRequest = createServerFn({ method: "POST" })
  .validator(createPurchaseRequestSchema)
  .handler(async ({ data }): Promise<CreatePurchaseRequestResult> => {
    try {
      const response = await http.post<CreatePurchaseRequestResult>(
        "/api/purchase-requests",
        data
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createPurchaseRequest")

      throw new Error(resolveCreatePurchaseRequestErrorMessage(error))
    }
  })

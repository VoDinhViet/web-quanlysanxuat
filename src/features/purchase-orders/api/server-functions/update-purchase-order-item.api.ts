import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchaseOrderItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.invalid_status_transition":
      return "Đơn mua hàng đã đổi trạng thái. Vui lòng tải lại trang."
    case "purchase_order_item.error.not_found":
      return "Không tìm thấy dòng vật tư này trong đơn mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Shared by the SL đặt cell (sends only `quantity`), the Đơn giá PO cell (sends only
// `unitPrice`), and the Lý do điều chỉnh SL dialog (sends only `quantityAdjustmentReason`) —
// mirror update-purchase-request-item.api.ts. `.refine()` rejects an all-undefined body before
// it reaches the backend.
export const updatePurchaseOrderItem = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        purchaseOrderId: z.uuid(),
        purchaseOrderItemId: z.uuid(),
        quantity: z.number().positive().optional(),
        unitPrice: z.number().positive().optional(),
        quantityAdjustmentReason: z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),
      })
      .refine(
        ({ quantity, unitPrice, quantityAdjustmentReason }) =>
          quantity !== undefined ||
          unitPrice !== undefined ||
          quantityAdjustmentReason !== undefined,
        "Không có thay đổi nào để lưu."
      )
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-orders/${data.purchaseOrderId}/items/${data.purchaseOrderItemId}`,
        {
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          quantityAdjustmentReason: data.quantityAdjustmentReason,
        }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseOrderItem")

      throw new Error(resolveUpdatePurchaseOrderItemErrorMessage(error))
    }
  })

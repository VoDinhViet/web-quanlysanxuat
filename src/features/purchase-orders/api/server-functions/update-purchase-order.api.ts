import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { PaymentTerm } from "@/lib/types/purchase-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.invalid_status_transition":
      return "Đơn mua hàng đã đổi trạng thái. Vui lòng tải lại trang."
    case "purchase_order.error.assigned_user_not_found":
      return "Không tìm thấy người phụ trách."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Header fields editable on the PO, all only while DRAFT — see PurchaseOrderDetailHeader.tsx's
// field components. `expectedDate` can't be cleared back to `null` (backend keeps it
// non-nullable-optional); the other 3 accept explicit `null` to clear (backend's
// `if (value)` guard skips validation on falsy, including `null`, and clears the column).
export const updatePurchaseOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      purchaseOrderId: z.uuid(),
      expectedDate: z
        .string()
        .min(1, "Vui lòng chọn ngày giao dự kiến")
        .optional(),
      assignedUserId: z.uuid().nullable().optional(),
      paymentTerm: z.enum(PaymentTerm).nullable().optional(),
      receiptWarehouseId: z.uuid().nullable().optional(),
      note: z.string().trim().max(1000).nullable().optional(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/purchase-orders/${data.purchaseOrderId}`, {
        expectedDate: data.expectedDate,
        assignedUserId: data.assignedUserId,
        paymentTerm: data.paymentTerm,
        receiptWarehouseId: data.receiptWarehouseId,
        note: data.note,
      })
    } catch (error) {
      logHttpError(error, "updatePurchaseOrder")

      throw new Error(resolveUpdatePurchaseOrderErrorMessage(error))
    }
  })

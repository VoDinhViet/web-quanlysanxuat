import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPurchaseOrderFormSchema } from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import { http, logHttpError } from "@/lib/http"
import { emptyToUndefined } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

// Mirrors CreatePurchaseOrderReqDto exactly — one POST carries the header (supplier + note) plus
// every picked line. Chained onto the form's own schema (not a hand-written parallel one), same
// pattern as create-purchase-quotation.api.ts. quantity/unitPrice are already number|undefined
// coming out of the form's own schema; only the header note and quantityAdjustmentReason (still
// strings) go through emptyToUndefined — the backend has no `null` variant for these, an omitted
// key is the only way to leave them unset.
const createPurchaseOrderPayloadSchema =
  createPurchaseOrderFormSchema.transform(({ supplierId, note, items }) => ({
    supplierId,
    note: emptyToUndefined(note),
    items: items.map((item) => ({
      purchaseRequestItemId: item.purchaseRequestItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      quantityAdjustmentReason: emptyToUndefined(item.quantityAdjustmentReason),
    })),
  }))

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreatePurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Nhà cung cấp không tồn tại."
    case "purchase_ledger.error.line_not_purchasable":
      return "Có dòng đề xuất đã hủy hoặc đề xuất chưa duyệt, không thể lập PO."
    case "purchase_order.error.duplicate_request_item":
      return "Một dòng đề xuất bị chọn 2 lần."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo đơn mua."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createPurchaseOrder = createServerFn({ method: "POST" })
  .validator(createPurchaseOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/purchase-orders", data)
    } catch (error) {
      logHttpError(error, "createPurchaseOrder")

      throw new Error(resolveCreatePurchaseOrderErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createQuotationFormSchema } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import { emptyToUndefined } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

const updateQuotationParamsSchema = z
  .object({
    purchaseQuotationId: z.string().trim().min(1),
    items: createQuotationFormSchema.shape.items,
    note: z.string().trim().max(1000).optional().nullable(),
  })
  .transform(({ purchaseQuotationId, items, note }) => ({
    purchaseQuotationId,
    payload: {
      note: note === undefined ? undefined : note ? note.trim() : null,
      items: items.map((item) => ({
        itemId: item.itemId,
        allocations: item.allocations.map((allocation) => ({
          purchaseRequestItemId: allocation.purchaseRequestItemId,
          quantity: allocation.quantity,
          quantityAdjustmentReason: emptyToUndefined(
            allocation.quantityAdjustmentReason
          ),
        })),
        suppliers: item.suppliers.map((supplier) => ({
          supplierId: supplier.supplierId,
          unitPrice: supplier.unitPrice,
          leadTimeDays: supplier.leadTimeDays,
          note: emptyToUndefined(supplier.note),
        })),
      })),
    },
  }))

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.not_draft":
      return "Báo giá không ở trạng thái Nháp, không thể chỉnh sửa."
    case "supplier.error.not_found":
      return "Nhà cung cấp không tồn tại."
    case "purchase_ledger.error.line_not_purchasable":
      return "Có dòng vật tư đã hủy hoặc đề xuất chưa duyệt, không thể lập báo giá."
    case "purchase_quotation.error.duplicate_request_item":
      return "Một dòng đề xuất bị gộp vào 2 vật tư khác nhau."
    case "purchase_quotation.error.duplicate_item_supplier":
      return "Một NCC được khai 2 lần cho cùng một vật tư với giá khác nhau."
    case "purchase_quotation_item.error.allocation_item_mismatch":
      return "Có dòng đề xuất không đúng mã vật tư của dòng báo giá."
    case "purchase_quotation_item.error.no_allocations":
      return "Có vật tư chưa gắn dòng đề xuất nào."
    case "auth.error.forbidden":
      return "Bạn không có quyền cập nhật báo giá."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePurchaseQuotation = createServerFn({ method: "POST" })
  .validator(updateQuotationParamsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-quotations/${data.purchaseQuotationId}`,
        data.payload
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseQuotation")

      throw new Error(resolveUpdatePurchaseQuotationErrorMessage(error))
    }
  })

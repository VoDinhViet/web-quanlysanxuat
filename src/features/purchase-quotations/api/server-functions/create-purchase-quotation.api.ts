import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createQuotationFormSchema } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import { emptyToUndefined } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

// Mirrors CreateQuotationReqDto exactly — one POST carries the whole item→allocations/suppliers
// tree. Chained onto the form's own schema (not a hand-written parallel one) so `data` inside
// `.handler()` is already wire-ready, same pattern as update-user.api.ts/create-material.api.ts.
// unitPrice/leadTimeDays are already number|undefined coming out of the form's own schema; only
// quantityAdjustmentReason/note (still strings) go through emptyToUndefined — the backend only
// allows explicit `null` for the header-level `note` (never sent here, per product decision — no
// header note field on this form), so every other optional field must OMIT its key instead, or
// the request 422s.
const createQuotationPayloadSchema = createQuotationFormSchema.transform(
  ({ items }) => ({
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
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreatePurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
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
      return "Bạn không có quyền tạo báo giá."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createPurchaseQuotation = createServerFn({ method: "POST" })
  .validator(createQuotationPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/purchase-quotations", data)
    } catch (error) {
      logHttpError(error, "createPurchaseQuotation")

      throw new Error(resolveCreatePurchaseQuotationErrorMessage(error))
    }
  })

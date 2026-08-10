import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

// Mirrors CreateQuotationReqDto exactly — one payload per supplier. The form itself
// (create-purchase-quotation.schema.ts) validates the wizard's raw string-based state; this
// validates the already-built wire shape reaching the network boundary, since the two shapes
// genuinely differ (numbers, not strings) and there's no 1:1 form-field-to-payload-field mapping
// to chain a single .transform() onto (see CreateQuotationForm.tsx's fan-out to N calls).
const createQuotationPayloadSchema = z.object({
  supplierId: z.string(),
  quotationDate: z.string(),
  validUntil: z.string().optional(),
  note: z.string().optional(),
  items: z.array(
    z.object({
      purchaseRequestItemId: z.string(),
      quantity: z.number(),
      unitPrice: z.number().optional(),
      leadTimeDays: z.number().optional(),
      note: z.string().optional(),
    })
  ),
})

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
      return "Có vật tư bị trùng trong danh sách báo giá."
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

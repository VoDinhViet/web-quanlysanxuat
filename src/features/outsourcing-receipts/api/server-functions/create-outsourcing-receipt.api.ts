import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOutsourcingReceiptSchema } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOutsourcingReceiptErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.items_required":
      return "Chưa chọn dòng nào cần nhận."
    case "outsourcing_receipt.error.duplicate_order_item":
      return "Có dòng OS-OUT bị chọn trùng — vui lòng kiểm tra lại."
    case "outsourcing_receipt.error.supplier_mismatch":
      return "Có dòng không cùng nhà cung cấp với phiếu — vui lòng chọn lại."
    case "outsourcing_receipt.error.order_not_posted":
      return "Có dòng OS-OUT nguồn chưa ở trạng thái đã gửi."
    case "outsourcing_receipt.error.quantity_exceeded":
      return "SL nhận vượt SL còn lại của dòng OS-OUT."
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu OS-OUT nguồn."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phiếu nhận gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Ghép sang payload wire CreateOutsourcingReceiptReqDto — items chỉ gửi 4 field BE cần
// (outsourcingOrderItemId/quantity/weight?/area?/note?), bỏ mọi field UI-only (outsourcingOrderCode,
// itemName...) khỏi payload.
const createOutsourcingReceiptPayloadSchema =
  createOutsourcingReceiptSchema.transform(
    ({ items, receiptDate, ...rest }) => ({
      ...rest,
      receiptDate: toIsoDate(receiptDate),
      items: items.map((item) => ({
        outsourcingOrderItemId: item.outsourcingOrderItemId,
        quantity: item.quantity,
        weight: item.weight,
        area: item.area,
        note: emptyToUndefined(item.note),
      })),
    })
  )

// POST /outsourcing-receipts — luôn tạo DRAFT, trả về void (không có code để hiện lại). Xem
// CreateOutsourcingReceiptForm.tsx.
export const createOutsourcingReceipt = createServerFn({ method: "POST" })
  .validator(createOutsourcingReceiptPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/outsourcing-receipts", data)
    } catch (error) {
      logHttpError(error, "createOutsourcingReceipt")

      throw new Error(resolveCreateOutsourcingReceiptErrorMessage(error))
    }
  })

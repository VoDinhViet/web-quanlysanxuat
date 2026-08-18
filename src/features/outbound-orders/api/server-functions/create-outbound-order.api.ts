import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOutboundOrderSchema } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.items_required":
      return "Chưa chọn dòng nào cần giao."
    case "outbound_order.error.duplicate_order_item":
      return "Có dòng PO bị chọn trùng — vui lòng kiểm tra lại."
    case "outbound_order.error.order_item_not_found":
      return "Không tìm thấy dòng PO nguồn."
    case "outbound_order.error.order_item_not_deliverable":
      return "Có dòng PO không còn ở trạng thái có thể giao."
    case "outbound_order.error.client_mismatch":
      return "Có dòng không cùng khách hàng với phiếu — vui lòng chọn lại."
    case "outbound_order.error.quantity_exceeds_ordered":
      return "SL giao vượt SL đặt của dòng PO."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phiếu giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Ghép sang payload wire CreateOutboundOrderReqDto — items khớp 1:1
// createOutboundOrderItemSchema (đã đúng 5 field OutboundOrderItemReqDto cần, xem
// create-outbound-order.schema.ts), chỉ còn ép kiểu quantity/note ở đây. itemId/productionJobId
// là snapshot từ dòng đã chọn ở picker, gửi thẳng không resolve lại.
const createOutboundOrderPayloadSchema = createOutboundOrderSchema.transform(
  ({ items, fulfillmentDate, note, ...rest }) => ({
    ...rest,
    fulfillmentDate: toIsoDate(fulfillmentDate),
    note: emptyToUndefined(note),
    items: items.map((item) => ({
      orderItemId: item.orderItemId,
      itemId: item.itemId,
      productionJobId: item.productionJobId,
      quantity: Number(item.quantity),
      note: emptyToUndefined(item.note),
    })),
  })
)

// POST /outbound-orders — luôn tạo DRAFT, trả về void (không có mã phiếu để hiện lại). Xem
// CreateOutboundOrderForm.tsx.
export const createOutboundOrder = createServerFn({ method: "POST" })
  .validator(createOutboundOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/outbound-orders", data)
    } catch (error) {
      logHttpError(error, "createOutboundOrder")

      throw new Error(resolveCreateOutboundOrderErrorMessage(error))
    }
  })

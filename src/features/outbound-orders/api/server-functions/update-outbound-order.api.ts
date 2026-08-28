import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateOutboundOrderSchema } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToNull, toIsoDate } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_editable":
      return "Phiếu không còn ở trạng thái Nháp — không thể sửa."
    case "outbound_order.error.quantity_exceeds_deliverable":
      return "Có dòng vượt số lượng có thể giao — kiểm tra lại tồn kho hoặc lệnh xuất khác đang giữ hàng."
    case "outbound_order.error.fg_warehouse_ambiguous":
      return "Không xác định được kho thành phẩm để xuất. Liên hệ quản trị kiểm tra danh mục kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Ghép sang payload wire UpdateOutboundOrderReqDto — cùng cách createOutboundOrderPayloadSchema
// làm (transform ngay ở tầng server function, không bake vào schema chung với client validator),
// chỉ khác PATCH dùng emptyToNull thay emptyToUndefined (thiếu key = không đổi). outboundOrderId
// giữ nguyên trong `rest` để build URL, không đi vào body.
const updateOutboundOrderPayloadSchema = updateOutboundOrderSchema.transform(
  ({
    fulfillmentDate,
    note,
    deliveryAddress,
    receiverName,
    receiverPhone,
    vehicle,
    items,
    ...rest
  }) => ({
    ...rest,
    fulfillmentDate: toIsoDate(fulfillmentDate),
    note: emptyToNull(note),
    deliveryAddress: emptyToNull(deliveryAddress),
    receiverName: emptyToNull(receiverName),
    receiverPhone: emptyToNull(receiverPhone),
    vehicle: emptyToNull(vehicle),
    items: items.map((item) => ({
      orderItemId: item.orderItemId,
      itemId: item.itemId,
      productionJobId: item.productionJobId,
      quantity: item.quantity,
      note: emptyToNull(item.note),
    })),
  })
)

// Chỉ hợp lệ khi phiếu còn DRAFT — xem UpdateOutboundOrderForm.tsx. Trả về void, nơi gọi tự
// invalidate rồi đọc lại qua query cache (cùng khuôn updateInventoryReceipt).
export const updateOutboundOrder = createServerFn({ method: "POST" })
  .validator(updateOutboundOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { outboundOrderId, ...body } = data
      await http.patch(`/api/outbound-orders/${outboundOrderId}`, body)
    } catch (error) {
      logHttpError(error, "updateOutboundOrder")

      throw new Error(resolveUpdateOutboundOrderErrorMessage(error))
    }
  })

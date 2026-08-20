import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { http, logHttpError } from "@/lib/http"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

// Mirrors CreateOutsourcingOrderReqDto — chained onto the form's own schema (not a hand-written
// parallel one) so `data` inside `.handler()` is already wire-ready, same pattern as
// create-purchase-quotation.api.ts. `operationId` on the form item is really the
// productionJobOperationId the picker copied in (see CreateOutsourcingOrderPickerSection.tsx).
const createOutsourcingOrderPayloadSchema =
  createOutsourcingOrderSchema.transform(
    ({ items, sendDate, expectedReturnDate, note, ...rest }) => ({
      ...rest,
      sendDate: toIsoDate(sendDate),
      expectedReturnDate: toIsoDate(expectedReturnDate),
      note: emptyToUndefined(note),
      items: items.map((item) => ({
        productionJobOperationId: item.operationId,
        quantity: item.quantity,
        weight: item.weight,
        area: item.area,
        note: emptyToUndefined(item.note),
      })),
    })
  )

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.not_found":
      return "Nhà cung cấp gia công không tồn tại."
    case "warehouse.error.not_found":
      return "Kho xuất hàng không tồn tại."
    case "warehouse.error.inactive":
      return "Kho xuất hàng không còn hoạt động."
    case "outsourcing_order.error.items_required":
      return "Phiếu cần ít nhất một chi tiết cần gia công."
    case "outsourcing_order.error.duplicate_operation":
      return "Có chi tiết bị chọn trùng công đoạn."
    case "outsourcing_order.error.operation_not_outsource":
      return "Có công đoạn không phải gia công ngoài."
    case "outsourcing_order.error.job_not_in_progress":
      return "Có Job không còn ở trạng thái đang sản xuất."
    case "outsourcing_order.error.item_not_resolvable":
      return "Có chi tiết không xác định được vật tư/thành phẩm."
    case "outsourcing_order.error.planned_quantity_exceeded":
      return "Có chi tiết vượt quá SL còn được phép gửi."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(createOutsourcingOrderPayloadSchema)
  .handler(async ({ data }): Promise<{ id: string; code: string }> => {
    try {
      const response = await http.post<{ id: string; code: string }>(
        "/api/outsourcing-orders",
        data
      )

      return { id: response.data.id, code: response.data.code }
    } catch (error) {
      logHttpError(error, "createOutsourcingOrder")

      throw new Error(resolveCreateOutsourcingOrderErrorMessage(error))
    }
  })

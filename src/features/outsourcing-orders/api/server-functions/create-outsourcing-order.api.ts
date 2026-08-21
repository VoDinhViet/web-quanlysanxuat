import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { http, logHttpError } from "@/lib/http"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  toIsoDate,
} from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

// Mirrors CreateOutsourcingOrderReqDto — chained onto the form's own schema (not a hand-written
// parallel one) so `data` inside `.handler()` is already wire-ready, same pattern as
// create-purchase-quotation.api.ts. Item's `job`/`bomItem`/`operation`/`unit` are display-nested
// refs the picker copied in as-is from the popup (see CreateOutsourcingOrderPickerSection.tsx) —
// this is the one place they flatten back into OutsourcingOrderItemReqDto's flat wire fields,
// straight passthrough (server does not resolve/re-validate any of it,
// docs/decisions/outsourcing-no-draft.md).
const createOutsourcingOrderPayloadSchema =
  createOutsourcingOrderSchema.transform(
    ({ items, sendDate, expectedReturnDate, note, ...rest }) => ({
      ...rest,
      sendDate: toIsoDate(sendDate),
      expectedReturnDate: emptyToUndefinedIsoDate(expectedReturnDate),
      note: emptyToUndefined(note),
      items: items.map((item) => ({
        productionJobOperationId: item.productionJobOperationId,
        productionJobId: item.job.id,
        itemId: item.itemId,
        operationId: item.operation.operationId,
        operationCode: item.operation.code,
        operationName: item.operation.name,
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
    case "outsourcing_order.error.items_required":
      return "Phiếu cần ít nhất một chi tiết cần gia công."
    case "outsourcing_order.error.duplicate_operation":
      return "Có chi tiết bị chọn trùng công đoạn."
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

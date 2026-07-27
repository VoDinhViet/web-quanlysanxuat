import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOrderSchema } from "@/features/orders/schemas/create-order.schema"
import { resolveAttachmentFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Header fields are already wire-ready — every empty->undefined and
// string->number/date mapping happens field-by-field on `orderFields` itself
// (order-form.schema.ts). Only `items`/`attachments` need reshaping here:
// `productLabel`/`productUnit` are UI-only (re-displayed in the items table
// without a second product fetch) and stripped before the payload goes out;
// `attachments` collapses to the wire's `attachmentFileIds`.
const createOrderPayloadSchema = createOrderSchema.transform(
  ({ items, attachments, ...rest }) => ({
    ...rest,
    items: items.map(
      ({ productId, quantity, unitPrice, discountPercent, note, status }) => ({
        productId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        discountPercent: Number(discountPercent),
        note: emptyToUndefined(note),
        status,
      })
    ),
    attachmentFileIds: resolveAttachmentFileIds(attachments),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.code_exists":
      return "Mã đơn hàng đã tồn tại."
    case "order.error.client_not_found":
      return "Khách hàng không tồn tại."
    case "order.error.staff_not_found":
      return "Nhân viên kinh doanh không tồn tại."
    case "order.error.product_not_found":
      return "Một sản phẩm trong đơn hàng không tồn tại."
    case "file.error.not_found":
      return "Tài liệu đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createOrder = createServerFn({ method: "POST" })
  .validator(createOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/orders", data)
    } catch (error) {
      logHttpError(error, "createOrder")

      throw new Error(resolveCreateOrderErrorMessage(error))
    }
  })

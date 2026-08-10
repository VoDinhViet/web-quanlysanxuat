import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOrderSchema } from "@/features/orders/schemas/create-order.schema"
import { resolveApiAttachmentFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

// Every field is already wire-ready by the time this runs — string->number
// mapping happens field-by-field on createOrderSchema/orderItemFormFields, and
// the two UI-only item fields are already dropped by orderItemFormSchema's own
// transform (order-item-form.schema.ts). All that's left is collapsing attachments
// into attachmentFileIds — kept here, not on the schema, matching every other
// feature's file-field handling (see "Server functions" in architecture.md).
const createOrderPayloadSchema = createOrderSchema.transform(
  ({ attachments, ...rest }) => ({
    ...rest,
    attachmentFileIds: resolveApiAttachmentFileIds(attachments),
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
    case "order.error.item_not_found":
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

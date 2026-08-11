import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { resolveApiAttachmentFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { OrderStatus } from "@/lib/types/order.type"

// Every field is already wire-ready by the time this runs — string->number mapping happens
// field-by-field on updateOrderSchema, and the two UI-only item fields are already dropped
// by orderItemFormSchema's own transform (order-item-form.schema.ts). All that's left is
// collapsing attachments into attachmentFileIds — kept here, not on the schema, matching
// every other feature's file-field handling (see "Server functions" in architecture.md).
// `status` is dropped entirely when it's AWAITING_PRODUCTION or REJECTED: both are only
// reachable through POST .../approve / .../reject — sending either here hits
// order.error.status_not_settable_directly. A PATCH treats a missing key as "leave
// unchanged", which is exactly right since the form can only ever be *displaying* those
// statuses here, never setting them (UpdateOrderForm already seeds DRAFT instead of REJECTED,
// so this is a safety net, not the normal path).
const updateOrderPayloadSchema = updateOrderSchema.transform(
  ({ attachments, status, ...rest }) => ({
    ...rest,
    ...(status === OrderStatus.AWAITING_PRODUCTION ||
    status === OrderStatus.REJECTED
      ? {}
      : { status }),
    attachmentFileIds: resolveApiAttachmentFileIds(attachments),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "order.error.not_editable":
      return "Đơn hàng đã hoàn thành hoặc đã hủy nên không thể chỉnh sửa."
    case "order.error.client_not_found":
      return "Khách hàng không tồn tại."
    case "order.error.staff_not_found":
      return "Nhân viên kinh doanh không tồn tại."
    case "order.error.item_not_found":
      return "Một sản phẩm trong đơn hàng không tồn tại."
    case "order.error.status_not_settable_directly":
      return "Không thể đặt trạng thái này trực tiếp."
    case "file.error.not_found":
      return "Tài liệu đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateOrder = createServerFn({ method: "POST" })
  .validator(updateOrderPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { orderId, ...payload } = data
      await http.patch(`/api/orders/${orderId}`, payload)
    } catch (error) {
      logHttpError(error, "updateOrder")

      throw new Error(resolveUpdateOrderErrorMessage(error))
    }
  })

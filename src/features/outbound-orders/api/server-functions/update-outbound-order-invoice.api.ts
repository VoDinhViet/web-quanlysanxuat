import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateOutboundOrderInvoiceSchema } from "@/features/outbound-orders/schemas/update-outbound-order-invoice.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOutboundOrderInvoiceErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.invoice_requires_delivered":
      return "Chỉ nhập hóa đơn khi phiếu đã giao. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền cập nhật hóa đơn giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateOutboundOrderInvoice = createServerFn({ method: "POST" })
  .validator(updateOutboundOrderInvoiceSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/outbound-orders/${data.outboundOrderId}/invoice`, {
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
      })
    } catch (error) {
      logHttpError(error, "updateOutboundOrderInvoice")

      throw new Error(resolveUpdateOutboundOrderInvoiceErrorMessage(error))
    }
  })

import { z } from "zod"

// Wire contract for PATCH /api/outbound-orders/:outboundOrderId/invoice — shared by
// OutboundOrderInvoiceDialog's form and the server function's validator. Same 100-char cap as the
// backend's `invoiceNo`.
export const updateOutboundOrderInvoiceSchema = z.object({
  outboundOrderId: z.uuid(),
  invoiceNo: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số hóa đơn")
    .max(100, "Số hóa đơn tối đa 100 ký tự"),
  invoiceDate: z.iso.date("Vui lòng chọn ngày xuất hóa đơn"),
})

export type UpdateOutboundOrderInvoiceSchema = z.infer<
  typeof updateOutboundOrderInvoiceSchema
>

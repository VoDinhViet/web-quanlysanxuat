import { z } from "zod"

import { FulfillmentType } from "@/lib/types/outbound-order.type"

// Một dòng của phiếu đang sửa — dòng có sẵn (round-trip nguyên vẹn từ OutboundOrderItem, chỉ
// quantity/note đổi được) hoặc dòng vừa thêm qua popup "Thêm từ PO/Job"
// (OutboundOrderAddItemsDialog.tsx, đọc GET .../unfulfilled-order-items với `clientId`/
// `excludeOutboundOrderId` — BE đã loại trừ chéo DO đang sửa sẵn, xem outbound-orders.query.ts).
// orderItemId/itemId/productionJobId không editable trực tiếp ở UI dù schema cho phép — chỉ
// gán khi chọn dòng từ popup hoặc round-trip từ dòng có sẵn.
export const updateOutboundOrderItemSchema = z.object({
  orderItemId: z.string().trim().min(1),
  itemId: z.string().trim().min(1),
  productionJobId: z.string().nullable(),
  quantity: z
    .number("SL giao phải lớn hơn 0")
    .positive("SL giao phải lớn hơn 0")
    .optional()
    .pipe(z.number("SL giao phải lớn hơn 0")),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
})

export type UpdateOutboundOrderItemValue = z.input<
  typeof updateOutboundOrderItemSchema
>

// Wire contract cho PATCH /api/outbound-orders/:outboundOrderId (BUG-090) — chỉ hợp lệ khi phiếu
// còn DRAFT (E259). clientId không có ở đây — bất biến, khớp UpdateOutboundOrderReqDto
// (be-quanlysanxuat) bỏ field này.
export const updateOutboundOrderSchema = z.object({
  outboundOrderId: z.uuid(),
  fulfillmentDate: z.string().trim().min(1, "Vui lòng chọn ngày giao"),
  fulfillmentType: z.enum(FulfillmentType),
  note: z.string().trim(),
  // 4 field vận chuyển (BUG-090, mở rộng theo UI Spec) — cùng field y hệt create-outbound-order.schema.ts.
  deliveryAddress: z.string().trim(),
  receiverName: z.string().trim(),
  receiverPhone: z.string().trim(),
  vehicle: z.string().trim(),
  items: z
    .array(updateOutboundOrderItemSchema)
    .min(1, "Cần ít nhất một dòng giao hàng"),
})

export type UpdateOutboundOrderSchema = z.input<
  typeof updateOutboundOrderSchema
>

export const updateOutboundOrderFormDefaultValues: UpdateOutboundOrderSchema = {
  outboundOrderId: "",
  fulfillmentDate: "",
  fulfillmentType: FulfillmentType.STANDARD,
  note: "",
  deliveryAddress: "",
  receiverName: "",
  receiverPhone: "",
  vehicle: "",
  items: [],
}

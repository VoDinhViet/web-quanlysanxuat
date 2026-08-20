import { z } from "zod"

import { FulfillmentType } from "@/lib/types/outbound-order.type"

// Bước ① (picker) của wizard "Tạo phiếu giao hàng" — một dòng cho mỗi dòng PO nguồn đã chọn. Chỉ
// đúng 5 field OutboundOrderItemReqDto cần — orderItemId/itemId/productionJobId/quantity/note.
// Không có field hiển thị (orderCode, clientName, itemName...) — schema này chỉ phục vụ xác nhận
// data gửi API tạo, không việc khác. Order/Job/Item/Unit/SL đặt để hiển thị lại ở bước ②/③ được
// tra cứu qua `useUnfulfilledOrderItemLookup` (đọc thẳng từ cache React Query của
// GET /outbound-orders/unfulfilled-order-items — dòng nào đã chọn cũng chắc chắn có trong cache
// vì phải hiện ra ở bước ① mới chọn được), không lưu trong item value. SL giao vượt SL đặt cũng
// không còn chặn ở form nữa — BE tự kiểm khi tạo phiếu (E193).
export const createOutboundOrderItemSchema = z.object({
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

export type CreateOutboundOrderItemValue = z.input<
  typeof createOutboundOrderItemSchema
>

// Toàn bộ wizard 3 bước — clientId chọn ở đầu bước ① (BE bắt buộc mọi dòng cùng 1 khách hàng —
// E192), fulfillmentDate/fulfillmentType/note nhập ở cuối bước ②, items chọn ở bước ①. Không có
// warehouseId — BE bỏ field này khỏi outbound_orders. Tên field khớp CreateOutboundOrderReqDto —
// đổi tên từ deliveryDate/deliveryMethod sang fulfillmentDate/fulfillmentType khi BE đổi tên.
export const createOutboundOrderSchema = z.object({
  clientId: z.string().trim().min(1, "Vui lòng chọn khách hàng"),
  fulfillmentDate: z.string().trim().min(1, "Vui lòng chọn ngày giao"),
  fulfillmentType: z.enum(FulfillmentType),
  note: z.string().trim(),
  items: z
    .array(createOutboundOrderItemSchema)
    .min(1, "Cần chọn ít nhất một dòng cần giao"),
})

export type CreateOutboundOrderSchema = z.input<
  typeof createOutboundOrderSchema
>

export const createOutboundOrderFormDefaultValues: CreateOutboundOrderSchema = {
  clientId: "",
  fulfillmentDate: "",
  fulfillmentType: FulfillmentType.STANDARD,
  note: "",
  items: [],
}

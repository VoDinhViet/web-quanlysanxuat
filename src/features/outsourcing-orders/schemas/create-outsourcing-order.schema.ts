import { z } from "zod"

// Bước ① của wizard tạo OS-OUT — một dòng cho mỗi outsourceable-operation đã chọn ở bước picker.
// `job`/`bomItem`/`operation`/`unit` mirror `OutsourceableOperation` nguyên xi (xem
// src/lib/types/outsourcing-order.type.ts) — picker gán thẳng row đã chọn vào item qua spread
// (`{...row, quantity, weight, area, note}`, xem buildPickedOutsourcingOrderItem trong
// CreateOutsourcingOrderPickerSection.tsx), không phải map thủ công từng field. `productionJobId`/
// `itemId`/`operationCode`/`operationName` (payload POST thật, đi vào OutsourcingOrderItemReqDto)
// được đọc lại từ các ref lồng này ngay tại điểm build payload
// (create-outsourcing-order.api.ts) — không pre-flatten sớm ở form schema, đúng quy ước "wire-payload
// mapping happens in the server function's .validator()". plannedQuantity/sentQuantity/
// remainingQuantity là UI-only (hiển thị lại không cần fetch lần 2), cùng idiom
// inventory-receipt-from-po item schema.
const createOutsourcingOrderItemFields = {
  productionJobOperationId: z.string().trim().min(1),
  itemId: z.string().trim().min(1),
  job: z.object({
    id: z.string().trim().min(1),
    code: z.string(),
  }),
  bomItem: z.object({
    code: z.string(),
    name: z.string(),
  }),
  operation: z.object({
    operationId: z.string().trim().min(1).nullable(),
    code: z.string(),
    name: z.string(),
  }),
  unit: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
  }),
  plannedQuantity: z.number(),
  sentQuantity: z.number(),
  remainingQuantity: z.number(),
  quantity: z
    .number("SL gửi phải lớn hơn 0")
    .positive("SL gửi phải lớn hơn 0")
    .optional()
    .pipe(z.number("SL gửi phải lớn hơn 0")),
  weight: z
    .number("Trọng lượng phải là số ≥ 0")
    .min(0, "Trọng lượng phải là số ≥ 0")
    .optional(),
  area: z
    .number("Diện tích phải là số ≥ 0")
    .min(0, "Diện tích phải là số ≥ 0")
    .optional(),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
}

// SL gửi lần này không được vượt SL còn được phép gửi — chặn ngay ở form, cùng ràng buộc backend tự
// kiểm lại (mirror inventoryReceiptFromPoItemSchema's "SL nhận > SL đặt").
export const createOutsourcingOrderItemSchema = z
  .object(createOutsourcingOrderItemFields)
  .refine((item) => item.quantity <= item.remainingQuantity, {
    message: "SL gửi lần này không được vượt SL còn được phép gửi",
    path: ["quantity"],
  })

export type CreateOutsourcingOrderItemValue = z.input<
  typeof createOutsourcingOrderItemSchema
>

// Toàn bộ wizard 3 bước — supplierId/sendDate/expectedReturnDate/note nhập ở bước ②, items chọn ở
// bước ①. `expectedReturnDate` là tuỳ chọn (BE `DateFieldOptional({nullable: true})`) — refine
// `>= sendDate` chỉ chạy khi người dùng có nhập, so sánh trực tiếp 2 chuỗi yyyy-MM-dd (thứ tự từ
// điển khớp thứ tự thời gian với format cố định này). Không còn `warehouseId` — không dùng để
// trừ/theo dõi tồn kho, không đọc lại ở đâu (docs/decisions/wip-not-stocked.md), BE đã đổi optional.
export const createOutsourcingOrderSchema = z
  .object({
    supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp gia công"),
    sendDate: z.string().trim().min(1, "Vui lòng chọn ngày gửi đi"),
    expectedReturnDate: z.string().trim(),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
    items: z
      .array(createOutsourcingOrderItemSchema)
      .min(1, "Cần chọn ít nhất một chi tiết cần gia công"),
  })
  .refine(
    (value) =>
      !value.expectedReturnDate || value.expectedReturnDate >= value.sendDate,
    {
      message: "Ngày cần nhận về không được trước ngày gửi đi",
      path: ["expectedReturnDate"],
    }
  )

export type CreateOutsourcingOrderSchema = z.input<
  typeof createOutsourcingOrderSchema
>

export const createOutsourcingOrderFormDefaultValues: CreateOutsourcingOrderSchema =
  {
    supplierId: "",
    sendDate: "",
    expectedReturnDate: "",
    note: "",
    items: [],
  }

import { z } from "zod"

// Bước ① của wizard tạo OS-OUT — một dòng cho mỗi outsourceable-operation đã chọn ở bước picker.
// productionJobCode/itemCode/itemName/operationName/unitName/plannedQuantity/sentQuantity/
// remainingQuantity là UI-only (hiển thị lại không cần fetch lần 2), cùng idiom
// inventory-receipt-from-po item schema.
const createOutsourcingOrderItemFields = {
  operationId: z.string().trim().min(1),
  productionJobCode: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  operationName: z.string(),
  unitName: z.string(),
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
// bước ①. `expectedReturnDate >= sendDate` so sánh trực tiếp 2 chuỗi yyyy-MM-dd (thứ tự từ điển
// khớp thứ tự thời gian với format cố định này).
export const createOutsourcingOrderSchema = z
  .object({
    supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp gia công"),
    warehouseId: z.string().trim().min(1, "Vui lòng chọn kho xuất hàng"),
    sendDate: z.string().trim().min(1, "Vui lòng chọn ngày gửi đi"),
    expectedReturnDate: z
      .string()
      .trim()
      .min(1, "Vui lòng chọn ngày cần nhận về"),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
    items: z
      .array(createOutsourcingOrderItemSchema)
      .min(1, "Cần chọn ít nhất một chi tiết cần gia công"),
  })
  .refine((value) => value.expectedReturnDate >= value.sendDate, {
    message: "Ngày cần nhận về không được trước ngày gửi đi",
    path: ["expectedReturnDate"],
  })

export type CreateOutsourcingOrderSchema = z.input<
  typeof createOutsourcingOrderSchema
>

export const createOutsourcingOrderFormDefaultValues: CreateOutsourcingOrderSchema =
  {
    supplierId: "",
    warehouseId: "",
    sendDate: "",
    expectedReturnDate: "",
    note: "",
    items: [],
  }

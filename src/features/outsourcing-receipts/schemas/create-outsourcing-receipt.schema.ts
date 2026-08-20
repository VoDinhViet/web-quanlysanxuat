import { z } from "zod"

// Bước ① (picker) của wizard "Nhập hàng gia công về" — một dòng cho mỗi dòng OS-OUT còn số lượng
// chưa nhận đã chọn. Tên field khớp 1:1 PendingOrderItem (outsourcing-receipt.type.ts) —
// outsourcingOrderId/outsourcingOrderCode/sendDate/supplierId/supplierName/productionJobCode/
// itemCode/itemName/unitName/operationCode/operationName/sentQuantity là UI-only, hiển thị lại
// không cần fetch lần 2, cùng idiom create-outsourcing-order.schema.ts's item fields.
// `supplierId` không chọn tay ở form — NCC không còn là bước bắt buộc trước khi chọn hàng, mà tự
// suy ra theo dòng đầu tiên được chọn ở PickerSection (xem `toggleRow`/`toggleAll`).
const createOutsourcingReceiptItemFields = {
  outsourcingOrderItemId: z.string().trim().min(1),
  outsourcingOrderId: z.string().trim().min(1),
  outsourcingOrderCode: z.string(),
  sendDate: z.string(),
  supplierId: z.string().trim().min(1),
  supplierName: z.string(),
  productionJobCode: z.string().nullable(),
  itemCode: z.string(),
  itemName: z.string(),
  unitName: z.string(),
  operationCode: z.string(),
  operationName: z.string(),
  sentQuantity: z.number(),
  quantity: z
    .number("SL nhận phải lớn hơn 0")
    .positive("SL nhận phải lớn hơn 0")
    .optional()
    .pipe(z.number("SL nhận phải lớn hơn 0")),
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

// SL nhận lần này không được vượt SL đã gửi — chặn sơ bộ ở form; giới hạn thật (không vượt SL
// còn lại sau các lần nhận trước, BE chưa trả trên endpoint picker) do backend tự kiểm lại khi
// tạo phiếu (E172).
export const createOutsourcingReceiptItemSchema = z
  .object(createOutsourcingReceiptItemFields)
  .refine((item) => item.quantity <= item.sentQuantity, {
    message: "SL nhận lần này không được vượt SL đã gửi",
    path: ["quantity"],
  })

export type CreateOutsourcingReceiptItemValue = z.input<
  typeof createOutsourcingReceiptItemSchema
>

// Toàn bộ wizard 3 bước — supplierId chọn ở đầu bước ① (BE bắt buộc mọi dòng cùng 1 NCC — E187),
// receiptDate/requiresIqc nhập ở cuối bước ②, items chọn ở bước ①. Không có warehouseId — hàng gia
// công ngoài không đi qua tồn kho, xem docs/decisions/wip-not-stocked.md.
export const createOutsourcingReceiptSchema = z.object({
  supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp"),
  receiptDate: z.string().trim().min(1, "Vui lòng chọn ngày nhận"),
  requiresIqc: z.boolean(),
  items: z
    .array(createOutsourcingReceiptItemSchema)
    .min(1, "Cần chọn ít nhất một dòng cần nhận"),
})

export type CreateOutsourcingReceiptSchema = z.input<
  typeof createOutsourcingReceiptSchema
>

export const createOutsourcingReceiptFormDefaultValues: CreateOutsourcingReceiptSchema =
  {
    supplierId: "",
    receiptDate: "",
    requiresIqc: false,
    items: [],
  }

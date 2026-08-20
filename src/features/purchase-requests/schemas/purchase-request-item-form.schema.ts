import { z } from "zod"

import { emptyToUndefined } from "@/lib/zod-transforms"

// One dòng vật tư của đề xuất mua hàng. Không có unitPrice/status như order-item-form.schema.ts
// hay inventory-receipt-item-form.schema.ts — PR không có khái niệm giá. itemCode/itemName/
// itemUnit/minStock đều UI-only — vật tư được chọn từ bảng tích chọn ở tab 1
// (materialsQueryOptions, có unit/minStock), re-displayed ở tab 2 và trên rail "Phiếu tạm" mà
// không cần fetch lại; dropped by purchaseRequestItemFormSchema's own transform below before the
// payload reaches the create server function.
export const purchaseRequestItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  itemCode: z.string(),
  itemName: z.string(),
  itemUnit: z.string(),
  // Định mức tồn tối thiểu của vật tư tại thời điểm chọn — chỉ để so sánh và gợi ý cảnh báo ở
  // tab 2 (số lượng đề xuất thấp hơn định mức tồn), không chặn submit và không phải trường của
  // CreatePurchaseRequestItemReqDto.
  minStock: z.number(),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
}

export const purchaseRequestItemFormSchema = z
  .object(purchaseRequestItemFormFields)
  .transform(({ itemCode, itemName, itemUnit, minStock, ...item }) => item)

export type PurchaseRequestItemFormValue = z.input<
  typeof purchaseRequestItemFormSchema
>

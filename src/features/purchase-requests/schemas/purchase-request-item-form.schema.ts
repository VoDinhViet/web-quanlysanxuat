import { z } from "zod"

import { emptyToUndefined, isPositiveNumberString } from "@/lib/zod-transforms"

// One dòng vật tư của đề xuất mua hàng. Không có itemUnit/unitPrice/status như
// order-item-form.schema.ts hay inventory-receipt-item-form.schema.ts — PR không có khái
// niệm giá, và itemOptionsQueryOptions (qua useGetMaterialOptions) chỉ trả {id,code,name},
// không có unit (cùng lý do InventoryReceiptGenericItemsSection không có cột ĐVT).
export const purchaseRequestItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  // UI-only — re-displayed in the items table without a second item fetch;
  // dropped by purchaseRequestItemFormSchema's own transform below before the
  // payload reaches the create server function.
  itemLabel: z.string(),
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng phải lớn hơn 0")
    .transform(Number),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
}

export const purchaseRequestItemFormSchema = z
  .object(purchaseRequestItemFormFields)
  .transform(({ itemLabel, ...item }) => item)

export type PurchaseRequestItemFormValue = z.input<
  typeof purchaseRequestItemFormSchema
>

export const purchaseRequestItemDefaultValue: PurchaseRequestItemFormValue = {
  itemId: "",
  itemLabel: "",
  quantity: "1",
  note: "",
}

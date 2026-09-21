import { z } from "zod"

import { purchaseRequestItemFormSchema } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import { toIsoDate } from "@/lib/zod-transforms"

// Wire contract for POST /api/purchase-requests — also the client-side onSubmit validator
// for PurchaseRequestCreateForm. No `note`/`reason` header field — the backend has no such
// column yet (see PurchaseRequestTableCells.tsx's comment). `items` requires at least one
// line, same idiom as create-inventory-receipt.schema.ts (a request with zero lines is
// meaningless, unlike orders which allows empty).
export const createPurchaseRequestSchema = z.object({
  departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
  neededDate: z
    .string()
    .min(1, "Vui lòng chọn ngày cần hàng")
    .transform(toIsoDate),
  items: z
    .array(purchaseRequestItemFormSchema)
    .min(1, "Đề xuất cần ít nhất một dòng vật tư"),
})

export type CreatePurchaseRequestSchema = z.input<
  typeof createPurchaseRequestSchema
>

export const createPurchaseRequestFormDefaultValues: CreatePurchaseRequestSchema =
  {
    departmentId: "",
    neededDate: "",
    items: [],
  }

import { z } from "zod"

import { purchaseRequestItemFormSchema } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

// Wire contract for POST /api/purchase-requests — also the client-side onSubmit validator
// for PurchaseRequestCreateForm.
export const createPurchaseRequestSchema = z.object({
  departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
  neededDate: z
    .string()
    .min(1, "Vui lòng chọn ngày cần hàng")
    .transform(toIsoDate),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined)
    .optional(),
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
    note: "",
    items: [],
  }

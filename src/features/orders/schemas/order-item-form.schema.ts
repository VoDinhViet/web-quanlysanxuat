import { z } from "zod"

import {
  emptyToUndefined,
  isNonNegativeNumberString,
  isPercentString,
  isPositiveNumberString,
} from "@/lib/zod-transforms"

import { OrderItemStatus } from "@/lib/types/order.type"

// One order line. Each field carries its own wire-transform directly. Shared as-is by
// create-order.schema.ts and update-order.schema.ts — the backend uses the same
// OrderItemReqDto for both POST and PATCH, so there's nothing that diverges between the
// two flows here (unlike the header fields, which do — see update-order.schema.ts).
// OrderItemFormValue derives via z.input, not z.infer, so the live row-editing state (the
// items table and its add/edit dialog) still sees every field as a plain string. Only the
// parsed OUTPUT — z.array(orderItemFormSchema), resolved server-side — sees the transformed
// numbers/undefined and the two UI-only fields already dropped (orderItemFormSchema's own
// object-level transform below), so the create/update server functions never re-map a line
// themselves.
export const orderItemFormFields = {
  productId: z.string().trim().min(1, "Vui lòng chọn sản phẩm"),
  // UI-only — re-displayed in the items table without a second product fetch;
  // dropped by orderItemFormSchema's own transform below before the payload
  // reaches the create/update server function.
  productLabel: z.string(),
  productUnit: z.string(),
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng phải lớn hơn 0")
    .transform(Number),
  unitPrice: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Đơn giá không được âm")
    .transform(Number),
  discountPercent: z
    .string()
    .trim()
    .refine(isPercentString, "Chiết khấu phải trong khoảng 0-100")
    .transform(Number),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(OrderItemStatus),
}

// The object-level transform drops productLabel/productUnit from the OUTPUT
// only — z.input (below) still sees them, so the row-editing state keeps
// re-displaying the picked product without a second fetch.
export const orderItemFormSchema = z
  .object(orderItemFormFields)
  .transform(({ productLabel, productUnit, ...item }) => item)

export type OrderItemFormValue = z.input<typeof orderItemFormSchema>

export const ORDER_ITEM_DEFAULT_VALUE: OrderItemFormValue = {
  productId: "",
  productLabel: "",
  productUnit: "",
  quantity: "1",
  unitPrice: "0",
  discountPercent: "0",
  note: "",
  status: OrderItemStatus.NORMAL,
}

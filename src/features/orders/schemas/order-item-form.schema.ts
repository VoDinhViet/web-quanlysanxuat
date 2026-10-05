import { z } from "zod"

import { emptyToUndefined } from "@/lib/zod-transforms"

import { OrderItemStatus } from "@/lib/types/order.type"

// One order line. Each field carries its own wire-transform directly. Shared as-is by
// create-order.schema.ts and update-order.schema.ts — the backend uses the same
// OrderItemReqDto for both POST and PATCH, so there's nothing that diverges between the
// two flows here (unlike the header fields, which do — see update-order.schema.ts).
// OrderItemFormValue derives via z.input, not z.infer, so the live row-editing state (the
// items table and its add/edit dialog) already carries real numbers (`undefined` while a
// NumberField is blank). Only the parsed OUTPUT — z.array(orderItemFormSchema), resolved
// server-side — sees every numeric field guaranteed present and the two UI-only fields
// already dropped (orderItemFormSchema's own object-level transform below), so the
// create/update server functions never re-map a line themselves.
export const orderItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn sản phẩm"),
  // UI-only — re-displayed in the items table without a second item fetch;
  // dropped by orderItemFormSchema's own transform below before the payload
  // reaches the create/update server function.
  itemLabel: z.string(),
  itemUnit: z.string(),
  // `.default("")` để bản nháp localStorage cũ (chưa có 2 khoá này) vẫn hợp lệ.
  itemRevision: z.string().default(""),
  itemImageUrl: z.string().default(""),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  unitPrice: z
    .number("Đơn giá không được âm")
    .min(0, "Đơn giá không được âm")
    .optional()
    .pipe(z.number("Đơn giá không được âm")),
  discountPercent: z
    .number("Chiết khấu phải trong khoảng 0-100")
    .min(0, "Chiết khấu phải trong khoảng 0-100")
    .max(100, "Chiết khấu phải trong khoảng 0-100")
    .optional()
    .pipe(z.number("Chiết khấu phải trong khoảng 0-100")),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(OrderItemStatus),
}

// The object-level transform drops the UI-only item* fields from the OUTPUT
// only — z.input (below) still sees them, so the row-editing state keeps
// re-displaying the picked item without a second fetch.
export const orderItemFormSchema = z
  .object(orderItemFormFields)
  .transform(
    ({ itemLabel, itemUnit, itemRevision, itemImageUrl, ...item }) => item
  )

export type OrderItemFormValue = z.input<typeof orderItemFormSchema>

import { z } from "zod"

import { isNonNegativeNumberString } from "@/lib/zod-transforms"

// Wire contract for PATCH /api/production-orders/:orderId ("Lưu lại") — also the client-side
// onSubmit validator for the decision form. Quantity is kept as a string in form state (the
// TextField's own type) and transformed to a number here, same idiom as other numeric fields
// (e.g. orders' discountValue).
export const updateProductionOrderItemSchema = z.object({
  orderItemId: z.uuid(),
  quantity: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Số lượng không được âm")
    .transform(Number),
})

export const updateProductionOrderSchema = z.object({
  orderId: z.uuid(),
  items: z.array(updateProductionOrderItemSchema),
})

export type UpdateProductionOrderSchema = z.input<
  typeof updateProductionOrderSchema
>

// Only used for withForm's type inference in the detail screen's own section components — the
// real values always come from ProductionOrderDetailPage's own `defaultValues` (one row per
// item on the order, built from the query response), so an empty `items` here is harmless.
export const updateProductionOrderFormDefaultValues: UpdateProductionOrderSchema =
  {
    orderId: "",
    items: [],
  }

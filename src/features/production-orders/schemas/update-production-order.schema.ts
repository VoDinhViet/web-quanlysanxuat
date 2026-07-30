import { z } from "zod"

import { isNonNegativeNumberString } from "@/lib/zod-transforms"

// Wire contract for PATCH /api/production-orders/:productionOrderId — also the client-side
// onSubmit validator for the decision table. Quantity is kept as a string in form state (the
// numeric <Input>'s own type) and transformed to a number here, same idiom as other numeric
// fields (e.g. orders' discountValue). No integer refinement or upper bound: the backend column
// is numeric(18,3) and its DTO only enforces >= 0 — a line can be produced over the order
// quantity on purpose.
export const updateProductionOrderItemSchema = z.object({
  orderItemId: z.uuid(),
  quantity: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Số lượng phải là số không âm")
    .transform(Number),
})

export const updateProductionOrderSchema = z.object({
  productionOrderId: z.uuid(),
  items: z.array(updateProductionOrderItemSchema),
})

export type UpdateProductionOrderSchema = z.input<
  typeof updateProductionOrderSchema
>

// Only used for withForm's type inference in the detail screen's own section component — the
// real values always come from ProductionOrderDetailPage's own `defaultValues` (one row per
// item on the production order, built from the query response), so an empty `items` here is
// harmless.
export const updateProductionOrderFormDefaultValues: UpdateProductionOrderSchema =
  {
    productionOrderId: "",
    items: [],
  }

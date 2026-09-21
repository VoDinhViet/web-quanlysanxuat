import { z } from "zod"

// Wire contract for PATCH /api/production-orders/:productionOrderId — also the client-side
// onSubmit validator for the decision table. No integer refinement or upper bound: the backend
// column is numeric(18,3) and its DTO only enforces >= 0 — a line can be produced over the
// order quantity on purpose.
export const updateProductionOrderItemSchema = z.object({
  orderItemId: z.uuid(),
  quantity: z
    .number("Số lượng phải là số không âm")
    .min(0, "Số lượng phải là số không âm")
    .optional()
    .pipe(z.number("Số lượng phải là số không âm")),
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

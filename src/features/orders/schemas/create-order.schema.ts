import { z } from "zod"

import {
  orderFields,
  orderItemFormSchema,
} from "@/features/orders/schemas/order-form.schema"
import { fileFieldSchema } from "@/lib/file-field.schema"

// Wire contract for POST /api/orders — same fields as orderFormSchema.
// There's no order-update screen yet, so no update-order.schema.ts —
// add one alongside this file when that screen is built.
export const createOrderSchema = z.object({
  ...orderFields,
  items: z.array(orderItemFormSchema),
  attachments: z.array(fileFieldSchema),
})

export type CreateOrderSchema = z.input<typeof createOrderSchema>

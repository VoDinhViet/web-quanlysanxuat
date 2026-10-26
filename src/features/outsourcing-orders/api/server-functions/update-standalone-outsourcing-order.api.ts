import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { resolveStandaloneOutsourcingOrderErrorMessage } from "@/features/outsourcing-orders/api/server-functions/create-standalone-outsourcing-order.api"
import { standaloneOutsourcingOrderPayloadSchema } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { http, logHttpError } from "@/lib/http"

// DRAFT|REJECTED only — thay toàn bộ header và dòng của phiếu thủ công.
export const updateStandaloneOutsourcingOrder = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      outsourcingOrderId: z.uuid(),
      order: standaloneOutsourcingOrderPayloadSchema,
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/standalone`,
        data.order
      )
    } catch (error) {
      logHttpError(error, "updateStandaloneOutsourcingOrder")

      throw new Error(resolveStandaloneOutsourcingOrderErrorMessage(error))
    }
  })

import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { ItemStatus } from "@/lib/types/item.type"
import type { Consumable } from "@/lib/types/consumable.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetConsumablesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Broader than any single caller's own search schema — see get-clients.api.ts for why
// (route-facing `consumablesSearchSchema` stays local to the consumables route, this one just needs
// to be wire-valid for the backend). `type` isn't part of this schema — this feature only ever
// reads CONSUMABLE, so the handler below fixes it, mirroring get-items.api.ts's own `type` handling.
const getConsumablesSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  clientId: z.string().trim().min(1).optional(),
  status: z.enum(ItemStatus).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

export const getConsumables = createServerFn({ method: "GET" })
  .validator(getConsumablesSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Consumable>> => {
    try {
      const response = await http.get<PaginatedResponse<Consumable>>(
        "/api/items",
        { params: { ...data, type: "CONSUMABLE" } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getConsumables")

      throw new Error(resolveGetConsumablesErrorMessage(error))
    }
  })

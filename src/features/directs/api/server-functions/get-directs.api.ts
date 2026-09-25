import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { ItemStatus } from "@/lib/types/item.type"
import type { Direct } from "@/lib/types/direct.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetDirectsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Broader than any single caller's own search schema — see get-clients.api.ts for why
// (route-facing `directsSearchSchema` stays local to the directs route, this one just needs
// to be wire-valid for the backend). `type` isn't part of this schema — this feature only ever
// reads DIRECT, so the handler below fixes it, mirroring get-items.api.ts's own `type` handling.
const getDirectsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  clientId: z.string().trim().min(1).optional(),
  status: z.enum(ItemStatus).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

export const getDirects = createServerFn({ method: "GET" })
  .validator(getDirectsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Direct>> => {
    try {
      const response = await http.get<PaginatedResponse<Direct>>("/api/items", {
        params: { ...data, type: "DIRECT" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getDirects")

      throw new Error(resolveGetDirectsErrorMessage(error))
    }
  })

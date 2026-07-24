import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { BomEntityOption } from "@/features/products/types/bom-item.type"

const bomMaterialOptionsSearchSchema = z.object({
  q: z.string().trim().optional(),
})

// Options for the "add BOM item" material picker. The full Material type lives
// in the materials feature, which products must not import from (CLAUDE.md), so
// the response is narrowed to {id, code, name} here. `q` fuzzy-matches
// code/name. Degrades to an empty list on failure.
export const getBomMaterialOptions = createServerFn({ method: "GET" })
  .validator(bomMaterialOptionsSearchSchema)
  .handler(async ({ data }): Promise<BomEntityOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<BomEntityOption>>(
        "/api/materials",
        {
          params: {
            q: data.q || undefined,
            status: "ACTIVE",
            limit: FILTER_OPTIONS_LIMIT,
          },
        }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getBomMaterialOptions")

      return []
    }
  })

import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import {
  ProductStatus,
  ProductType,
} from "@/features/products/types/product.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { BomEntityOption } from "@/features/products/types/bom-item.type"

const bomProductOptionsSearchSchema = z.object({
  q: z.string().trim().optional(),
})

// Options for the "add BOM item" product picker: only WIP (bán thành phẩm,
// backend enum `WORK_IN_PROGRESS`) products may be added as a structure node
// (backend rejects others, E053), so filter `type=WORK_IN_PROGRESS` at the
// source. Narrowed to {id, code, name}. `q` drives the backend's
// accent-insensitive search. Degrades to an empty list on failure — the picker
// is a select, not core data.
export const getBomProductOptions = createServerFn({ method: "GET" })
  .validator(bomProductOptionsSearchSchema)
  .handler(async ({ data }): Promise<BomEntityOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<BomEntityOption>>(
        "/api/products",
        {
          params: {
            q: data.q || undefined,
            type: ProductType.WORK_IN_PROGRESS,
            status: ProductStatus.ACTIVE,
            limit: FILTER_OPTIONS_LIMIT,
          },
        }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getBomProductOptions")

      return []
    }
  })

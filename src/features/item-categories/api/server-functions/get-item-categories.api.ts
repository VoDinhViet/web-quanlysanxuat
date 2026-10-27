import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ItemCategory } from "@/lib/types/item-category.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

const getItemCategoriesSchema = z.object({
  q: optional(z.string().trim()),
})

export const getItemCategories = createServerFn({ method: "GET" })
  .validator(getItemCategoriesSchema)
  .handler(async ({ data }): Promise<ItemCategory[]> => {
    try {
      // Not paginated: returns the whole catalogue as a bare array.
      const response = await http.get<ItemCategory[]>("/api/item-categories", {
        params: { q: data.q },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getItemCategories")

      throw new Error(GENERIC_ERROR_MESSAGE)
    }
  })

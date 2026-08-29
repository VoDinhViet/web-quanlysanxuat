import { z } from "zod"

/** `page`/`limit` shared by every list route's search schema — spread as
 *  `...paginationSearchFields()` into the object passed to `z.object({...})`, or
 *  `...paginationSearchFields(20)` for a screen whose default page size isn't 10. */
export function paginationSearchFields(defaultLimit: 10 | 20 | 50 = 10) {
  return {
    page: z.number().int().min(1).catch(1),
    limit: z
      .union([z.literal(10), z.literal(20), z.literal(50)])
      .catch(defaultLimit),
  }
}

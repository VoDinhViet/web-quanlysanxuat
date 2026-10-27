import { queryOptions } from "@tanstack/react-query"

import { getItemCategories } from "@/features/item-categories/api/server-functions/get-item-categories.api"

// Reference options for the directs form and the directs / inventory-directs filters.
export const itemCategoryOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["item-categories", "options"],
    queryFn: () => getItemCategories({ data: {} }),
    staleTime: 5 * 60_000,
  })

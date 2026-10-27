import { queryOptions } from "@tanstack/react-query"

import { getItemCategories } from "@/features/item-categories/api/server-functions/get-item-categories.api"
import type { ItemCategoriesSearchSchema } from "@/features/item-categories/schemas/item-categories-search.schema"

export const itemCategoriesQueryOptions = ({ q }: ItemCategoriesSearchSchema) =>
  queryOptions({
    queryKey: ["item-categories", "list", { q }],
    queryFn: () => getItemCategories({ data: { q } }),
  })

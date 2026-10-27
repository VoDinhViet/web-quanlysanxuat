import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { itemCategoriesQueryOptions } from "@/features/item-categories/api/options"
import { ItemCategoriesPage } from "@/features/item-categories/pages/ItemCategoriesPage"
import { itemCategoriesSearchSchema } from "@/features/item-categories/schemas/item-categories-search.schema"

export const Route = createFileRoute(
  "/(authed)/manage_/settings/item-categories"
)({
  validateSearch: itemCategoriesSearchSchema,
  loader: ({ context, location }) => {
    return context.queryClient.query({
      ...itemCategoriesQueryOptions(
        itemCategoriesSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    })
  },
  component: ItemCategoriesPage,
  pendingComponent: PagePending,
})

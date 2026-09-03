import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { productionOrdersQueryOptions } from "@/features/production-orders/api/options"
import { ProductionOrdersPage } from "@/features/production-orders/pages/ProductionOrdersPage"
import { productionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/production-orders/")({
  validateSearch: productionOrdersSearchSchema,
  // No loaderDeps: see orders/index.tsx for why — a filter/pagination navigation must
  // not create a new route match, which would re-trigger this loader and blank
  // the outlet. The list itself is read client-side in
  // ProductionOrdersPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...productionOrdersQueryOptions(
        productionOrdersSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: ProductionOrdersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})

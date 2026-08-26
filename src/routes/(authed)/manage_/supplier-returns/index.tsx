import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { supplierReturnsQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnsPage } from "@/features/supplier-returns/pages/SupplierReturnsPage"
import { supplierReturnsSearchSchema } from "@/features/supplier-returns/schemas/supplier-returns-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/supplier-returns/")({
  validateSearch: supplierReturnsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the outlet. The list itself is read client-side in
  // SupplierReturnsPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        supplierReturnsQueryOptions(
          supplierReturnsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: SupplierReturnsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})

import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { SupplierReturnsPage } from "@/features/supplier-returns/pages/SupplierReturnsPage"
import { supplierReturnsQueryOptions } from "@/features/supplier-returns/api/options"
import { supplierReturnsSearchSchema } from "@/features/supplier-returns/schemas/supplier-returns-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/supplier-returns")({
  validateSearch: supplierReturnsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the whole page. The list itself is read client-side in
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
  pendingComponent: PageLoading,
})

import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { UpdateSupplierPage } from "@/features/suppliers/pages/UpdateSupplierPage"
import {
  supplierGroupOptionsQueryOptions,
  supplierQueryOptions,
} from "@/features/suppliers/api/options"
import { countryOptionsQueryOptions } from "@/features/countries/api"

export const Route = createFileRoute(
  "/(authed)/manage_/suppliers_/$supplierId/update"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        supplierQueryOptions(params.supplierId)
      ),
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: UpdateSupplierPage,
  pendingComponent: PageLoading,
})

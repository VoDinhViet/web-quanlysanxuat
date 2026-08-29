import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { SupplierDetailPage } from "@/features/suppliers/pages/SupplierDetailPage"
import {
  supplierGroupOptionsQueryOptions,
  supplierQueryOptions,
} from "@/features/suppliers/api/options"
import { countryOptionsQueryOptions } from "@/features/countries/api"

export const Route = createFileRoute(
  "/(authed)/manage_/suppliers_/$supplierId"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        supplierQueryOptions(params.supplierId)
      ),
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: SupplierDetailPage,
  pendingComponent: LayoutPagePending,
})

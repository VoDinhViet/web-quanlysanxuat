import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
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
      context.queryClient.query({
        ...supplierQueryOptions(params.supplierId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierGroupOptionsQueryOptions(),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...countryOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: UpdateSupplierPage,
  pendingComponent: LayoutPagePending,
})

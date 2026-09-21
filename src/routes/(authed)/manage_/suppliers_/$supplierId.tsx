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
  component: SupplierDetailPage,
  pendingComponent: LayoutPagePending,
})

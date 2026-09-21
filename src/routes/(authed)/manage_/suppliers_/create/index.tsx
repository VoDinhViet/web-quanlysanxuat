import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { countryOptionsQueryOptions } from "@/features/countries/api"
import { supplierGroupOptionsQueryOptions } from "@/features/suppliers/api/options"
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.query({
        ...supplierGroupOptionsQueryOptions(),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...countryOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: CreateSupplierPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})

import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"
import { supplierGroupOptionsQueryOptions } from "@/features/suppliers/api/options"
import { countryOptionsQueryOptions } from "@/features/countries/api"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: CreateSupplierPage,
  pendingComponent: PageLoading,
})

import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"
import { supplierGroupOptionsQueryOptions } from "@/features/suppliers/api/suppliers.options"
import { countryOptionsQueryOptions } from "@/features/countries/api"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "suppliers:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: CreateSupplierPage,
  pendingComponent: PageLoading,
})

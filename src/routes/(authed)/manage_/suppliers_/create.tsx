import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"
import {
  countryOptionsQueryOptions,
  supplierGroupOptionsQueryOptions,
} from "@/features/suppliers/suppliers.query"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "suppliers:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: CreateSupplierPage,
})

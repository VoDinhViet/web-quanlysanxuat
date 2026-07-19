import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditSupplierPage } from "@/features/suppliers/pages/EditSupplierPage"
import {
  countryOptionsQueryOptions,
  supplierGroupOptionsQueryOptions,
  supplierQueryOptions,
} from "@/features/suppliers/suppliers.query"

export const Route = createFileRoute(
  "/(authed)/manage_/suppliers_/$supplierId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "suppliers:update"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        supplierQueryOptions(params.supplierId)
      ),
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: EditSupplierPage,
})

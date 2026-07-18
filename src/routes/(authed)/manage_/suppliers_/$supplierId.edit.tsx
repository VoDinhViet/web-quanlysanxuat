import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditSupplierPage } from "@/features/suppliers/pages/EditSupplierPage"
import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplier } from "@/features/suppliers/server-functions/get-supplier"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"

export const Route = createFileRoute(
  "/(authed)/manage_/suppliers_/$supplierId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "suppliers:update"),
  loader: async ({ params }) => {
    const [supplier, supplierGroupOptions, countryOptions] = await Promise.all([
      getSupplier({ data: { supplierId: params.supplierId } }),
      getSupplierGroupFilterOptions(),
      getCountryFilterOptions(),
    ])

    return { supplier, supplierGroupOptions, countryOptions }
  },
  component: EditSupplierPage,
})

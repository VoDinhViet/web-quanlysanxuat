import { createFileRoute } from "@tanstack/react-router"

import { EditSupplierPage } from "@/features/suppliers/pages/EditSupplierPage"
import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplier } from "@/features/suppliers/server-functions/get-supplier"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"

export const Route = createFileRoute(
  "/(authed)/manage_/suppliers_/$supplierId/edit"
)({
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

import { createFileRoute } from "@tanstack/react-router"

import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"
import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create")({
  loader: async () => {
    const [supplierGroupOptions, countryOptions] = await Promise.all([
      getSupplierGroupFilterOptions(),
      getCountryFilterOptions(),
    ])

    return { supplierGroupOptions, countryOptions }
  },
  component: CreateSupplierPage,
})

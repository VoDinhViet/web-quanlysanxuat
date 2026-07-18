import { createFileRoute } from "@tanstack/react-router"

import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage"
import { suppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"
import { getSupplierStats } from "@/features/suppliers/server-functions/get-supplier-stats"
import { getSuppliers } from "@/features/suppliers/server-functions/get-suppliers"

export const Route = createFileRoute("/(authed)/manage_/suppliers")({
  validateSearch: suppliersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [suppliers, stats, supplierGroupOptions, countryOptions] =
      await Promise.all([
        getSuppliers({ data: deps }),
        getSupplierStats(),
        getSupplierGroupFilterOptions(),
        getCountryFilterOptions(),
      ])

    return { suppliers, stats, supplierGroupOptions, countryOptions }
  },
  component: SuppliersPage,
})

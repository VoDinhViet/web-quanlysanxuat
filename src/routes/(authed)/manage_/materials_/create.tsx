import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateMaterialPage } from "@/features/materials/pages/CreateMaterialPage"
import { getClientOptions } from "@/features/materials/server-functions/get-client-options"
import { getMaterialGroupOptions } from "@/features/materials/server-functions/get-material-group-options"
import { getSupplierOptions } from "@/features/materials/server-functions/get-supplier-options"
import { getUnitOptions } from "@/features/materials/server-functions/get-unit-options"

export const Route = createFileRoute("/(authed)/manage_/materials_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:create"),
  loader: async () => {
    const [unitOptions, materialGroupOptions, clientOptions, supplierOptions] =
      await Promise.all([
        getUnitOptions(),
        getMaterialGroupOptions(),
        getClientOptions(),
        getSupplierOptions(),
      ])

    return { unitOptions, materialGroupOptions, clientOptions, supplierOptions }
  },
  component: CreateMaterialPage,
})

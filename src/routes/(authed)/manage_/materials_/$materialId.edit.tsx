import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditMaterialPage } from "@/features/materials/pages/EditMaterialPage"
import { getClientOptions } from "@/features/materials/server-functions/get-client-options"
import { getMaterial } from "@/features/materials/server-functions/get-material"
import { getMaterialGroupOptions } from "@/features/materials/server-functions/get-material-group-options"
import { getSupplierOptions } from "@/features/materials/server-functions/get-supplier-options"
import { getUnitOptions } from "@/features/materials/server-functions/get-unit-options"

export const Route = createFileRoute(
  "/(authed)/manage_/materials_/$materialId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:update"),
  loader: async ({ params }) => {
    const [
      material,
      unitOptions,
      materialGroupOptions,
      clientOptions,
      supplierOptions,
    ] = await Promise.all([
      getMaterial({ data: { materialId: params.materialId } }),
      getUnitOptions(),
      getMaterialGroupOptions(),
      getClientOptions(),
      getSupplierOptions(),
    ])

    return {
      material,
      unitOptions,
      materialGroupOptions,
      clientOptions,
      supplierOptions,
    }
  },
  component: EditMaterialPage,
})

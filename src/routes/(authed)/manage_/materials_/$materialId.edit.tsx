import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditMaterialPage } from "@/features/materials/pages/EditMaterialPage"
import {
  materialGroupOptionsQueryOptions,
  materialQueryOptions,
  supplierOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/materials/materials.query"

export const Route = createFileRoute(
  "/(authed)/manage_/materials_/$materialId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:update"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        materialQueryOptions(params.materialId)
      ),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions()),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: EditMaterialPage,
})

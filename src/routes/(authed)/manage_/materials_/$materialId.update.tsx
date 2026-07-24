import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { UpdateMaterialPage } from "@/features/materials/pages/UpdateMaterialPage"
import {
  materialGroupOptionsQueryOptions,
  materialQueryOptions,
  supplierOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/materials/materials.query"

export const Route = createFileRoute(
  "/(authed)/manage_/materials_/$materialId/update"
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
  component: UpdateMaterialPage,
})

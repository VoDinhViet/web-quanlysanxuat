import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateMaterialPage } from "@/features/materials/pages/CreateMaterialPage"
import {
  materialGroupOptionsQueryOptions,
  supplierOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/materials/materials.query"

export const Route = createFileRoute("/(authed)/manage_/materials_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(unitOptionsQueryOptions()),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: CreateMaterialPage,
})

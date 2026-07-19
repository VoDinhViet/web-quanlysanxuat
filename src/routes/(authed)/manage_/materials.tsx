import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { MaterialsPage } from "@/features/materials/pages/MaterialsPage"
import { materialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { getClientOptions } from "@/features/materials/server-functions/get-client-options"
import { getMaterialGroupOptions } from "@/features/materials/server-functions/get-material-group-options"
import { getMaterialStats } from "@/features/materials/server-functions/get-material-stats"
import { getMaterials } from "@/features/materials/server-functions/get-materials"

export const Route = createFileRoute("/(authed)/manage_/materials")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:read"),
  validateSearch: materialsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [materials, stats, materialGroupOptions, clientOptions] =
      await Promise.all([
        getMaterials({ data: deps }),
        getMaterialStats(),
        getMaterialGroupOptions(),
        getClientOptions(),
      ])

    return { materials, stats, materialGroupOptions, clientOptions }
  },
  component: MaterialsPage,
})

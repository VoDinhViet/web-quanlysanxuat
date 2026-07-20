import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { MaterialsPage } from "@/features/materials/pages/MaterialsPage"
import {
  clientOptionsQueryOptions,
  materialGroupOptionsQueryOptions,
  materialsQueryOptions,
} from "@/features/materials/materials.query"
import { materialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"

export const Route = createFileRoute("/(authed)/manage_/materials")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:read"),
  validateSearch: materialsSearchSchema,
  loaderDeps: ({ search }) => search,
  // Prefetch into the query cache (SSR); the page reads the same options via
  // useSuspenseQuery — see .claude/rules/architecture.md.
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(materialsQueryOptions(deps)),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: MaterialsPage,
})

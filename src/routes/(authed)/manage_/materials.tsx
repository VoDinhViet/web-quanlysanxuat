import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { MaterialsPage } from "@/features/materials/pages/MaterialsPage"
import {
  materialGroupOptionsQueryOptions,
  materialsQueryOptions,
} from "@/features/materials/api/materials.options"
import { materialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { clientOptionsQueryOptions } from "@/features/clients/api"

export const Route = createFileRoute("/(authed)/manage_/materials")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:read"),
  validateSearch: materialsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and the router's
  // defaultPendingComponent, blanking the whole page). The list itself is
  // read client-side in MaterialsPage via useQuery instead. `location.search`
  // is already the router-validated search at runtime, but LoaderFnContext
  // types it as `{}` (loaderDeps-independent) — re-parsing it is a type-safe
  // way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        materialsQueryOptions(materialsSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: MaterialsPage,
  pendingComponent: PageLoading,
})

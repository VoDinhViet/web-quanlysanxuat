import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage"
import { suppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import {
  countryOptionsQueryOptions,
  supplierGroupOptionsQueryOptions,
  supplierStatsQueryOptions,
  suppliersQueryOptions,
} from "@/features/suppliers/suppliers.query"

export const Route = createFileRoute("/(authed)/manage_/suppliers")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "suppliers:read"),
  validateSearch: suppliersSearchSchema,
  loaderDeps: ({ search }) => search,
  // Prefetch into the query cache (SSR); the page reads the same options via
  // useSuspenseQuery — see .claude/rules/architecture.md.
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(suppliersQueryOptions(deps)),
      context.queryClient.ensureQueryData(supplierStatsQueryOptions()),
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ]),
  component: SuppliersPage,
})
